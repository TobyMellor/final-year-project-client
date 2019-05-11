import TrackModel from '../../models/audio-analysis/Track';
import Dispatcher from '../../events/Dispatcher';
import * as trackFactory from '../../factories/track';
import { FYPEvent, NeedleType, BranchType, TransitionType } from '../../types/enums';
import SampleQueueManager from './SampleQueueManager';
import { FYPEventPayload, BeatBatch, QueuedSampleBatch, Sample } from '../../types/general';
import * as conversions from '../../utils/conversions';
import BranchModel from '../../models/branches/Branch';
import fyp from '../../config/fyp';
import * as branchFactory from '../../factories/branch';
import ActionModel from '../../models/Action';
import SongTransitionModel from '../../models/SongTransition';
import QueuedSampleModel from '../../models/web-audio/QueuedBeat';
import config from '../../config';
import Translator from '../../../translations/Translator';

class WebAudioService {
  private static _instance: WebAudioService;

  private _audioContext: AudioContext;
  private _audioBuffers: { [trackID: string]: AudioBuffer } = {};
  private _nextTrackAudioBufferPromise: Promise<AudioBuffer>;
  private _samples: Sample[] = [];

  private _playingTrack: TrackModel = null;
  private _nextTrack: TrackModel = null;

  private constructor() {
    const AudioContext = (<any> window).AudioContext || (<any> window).webkitAudioContext;

    this._audioContext = new AudioContext();

    //   '4RVbK6cV0VqWdpCDcx3hiT', // Reborn
    //   '3O8NlPh2LByMU9lSRSHedm', // Controlla
    //   '6wVWJl64yoTzU27EI8ep20', // Crying Lightning
    //   '3aUFrxO1B8EW63QchEl3wX',
    //   '2hmHlBM0kPBm17Y7nVIW9f',
    //   '0wwPcA6wtMf6HUMpIRdeP7', // Hotline Bling
    //   '2zMMdC4xvRClYcWNFJBZ0j', // End Game
    //   '1JbR9RDP3ogVNEWFgNXAjh' // Look what you made me do

    Dispatcher.getInstance()
              .on(FYPEvent.TrackChangeRequested, ({ track }: FYPEventPayload['TrackChangeRequested']) => {
                this.startLoadingNextTrack(track);
              });

    // Once we've loaded the track and analyzed it
    Dispatcher.getInstance()
              .on(FYPEvent.BranchesAnalyzed, () => this.finishLoadingNextTrack());

    // When the Branch Service has given us new beats
    Dispatcher.getInstance()
              .on(FYPEvent.BeatBatchReady, ({ beatBatch }: FYPEventPayload['BeatBatchReady']) => {
                this.queueBeatsForPlaying(beatBatch);
              });

    Dispatcher.getInstance()
              .on(FYPEvent.SeekRequested, ({ percentage }: FYPEventPayload['SeekRequested']) => {
                this.seek(percentage);
              });

    const initialTrackID = '4RVbK6cV0VqWdpCDcx3hiT'; // TODO: Replace dynamically
    trackFactory.createTrack(initialTrackID)
                .then((initialTrack: TrackModel) => {
                  Dispatcher.getInstance()
                            .dispatch(FYPEvent.TrackChangeRequested, {
                              track: initialTrack,
                            } as FYPEventPayload['TrackChangeRequested']);
                });
  }

  public static getInstance(): WebAudioService {
    return this._instance || (this._instance = new this());
  }

  private startLoadingNextTrack(track: TrackModel) {
    this._nextTrack = track;

    async function getAudioBuffer(audioContext: AudioContext, trackID: string) {
      // Get the Audio Buffer for the corresponding mp3 file
      const response = await fetch(`tracks/${trackID}.mp3`);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      return audioBuffer;
    }

    this._nextTrackAudioBufferPromise = getAudioBuffer(this._audioContext, track.ID);
  }

  private async finishLoadingNextTrack() {
    if (!this._nextTrack || !this._nextTrackAudioBufferPromise) {
      throw new Error(Translator.errors.web_audio.next_track_not_found);
    }

    const nextTrackID = this._nextTrack.ID;
    this._audioBuffers[nextTrackID] = await this._nextTrackAudioBufferPromise;
    this._nextTrackAudioBufferPromise = null;

    // If we've not played anything yet, we can transition immediately
    if (!this._playingTrack) {
      this.changePlayingTrack();

      // Schedule multiple BeatBatches in advance
      this.dispatchBeatBatchRequested(this._playingTrack, null, 0, config.audio.schedulingAheadCount);

      return;
    }

    // Signal to the ActionDecider that we can now take the transition
    this.dispatchTrackChangeReady(this._nextTrack);
  }

  private changePlayingTrack() {
    this._playingTrack = this._nextTrack;
    this._nextTrack = null;

    this.dispatchTrackChanged(this._playingTrack);
  }

  public getPlayingTrack(): TrackModel | null {
    return this._playingTrack;
  }

  /**
   * When we receive some beats, add the beats to the SampleQueueManager's queue.
   * Then, start a sample for every beat. When all of these samples end, we'll
   * request more beats and repeat this process.
   *
   * The beat's to be queued include everything proceeding the origin beat of a branch,
   * and a single destination beat of the branch
   *
   * @param payload containing the beats to be queued
   * @param onEndedCallbackFn Optional, whether we want to run a custom fn wen the last sample
   *                          has finished playing (e.g. used for UI branch previewing)
   */
  private async queueBeatsForPlaying(
    beatBatch: BeatBatch,
    source: NeedleType = NeedleType.PLAYING,
    onEndedCallbackFn = () => {
      const nextAction = SampleQueueManager.lastAction();
      const nextTrack = nextAction instanceof SongTransitionModel ? nextAction.destinationTrack : nextAction.track;

      this.dispatchBeatBatchRequested(nextTrack, nextAction);
    },
  ) {
    if (!beatBatch || !beatBatch.originTrackBeats || beatBatch.originTrackBeats.length === 0) {
      throw new Error(Translator.errors.web_audio.empty_beat_batch);
    }

    const queuedSampleBatch = SampleQueueManager.add(this._audioContext, beatBatch);
    let lastSample: Sample;

    // When the first beat has started, we want to dispatch the "BeatBatchPlaying" event
    const onStartedFn = () => {
      this.dispatchBeatBatchPlaying(queuedSampleBatch, source);
    };

    const { queuedSamplesToNextOriginBeat: queuedSamples } = queuedSampleBatch;
    queuedSamples.forEach((queuedSample, i) => {
      const {
        originTrackSubmittedCurrentTime,
        originTrackBeats,
        originTrackBeatsDurationSecs,
        isTransitionSample,
      } = queuedSample;
      let sample: Sample;

      if (originTrackBeats.length) {
        sample = this.playSample(beatBatch.track,
                                 queuedSample,
                                 originTrackSubmittedCurrentTime,
                                 originTrackBeats[0].startSecs,
                                 originTrackBeatsDurationSecs,
                                 i === 0 && onStartedFn);
      }

      if (isTransitionSample) {
        const transition = beatBatch.action as SongTransitionModel;
        const isImmediateTransition = transition.type === TransitionType.IMMEDIATE;

        if (!isImmediateTransition) {
          const {
            destinationTrackSubmittedCurrentTime,
            destinationTrackBeats,
            destinationTrackBeatsDurationSecs,
          } = queuedSample;

          sample = this.playSample(transition.destinationTrack,
                                   queuedSample,
                                   destinationTrackSubmittedCurrentTime,
                                   destinationTrackBeats[0].startSecs,
                                   destinationTrackBeatsDurationSecs);
        }

        lastSample.source.onended = () => {
          this.dispatchTrackChanging(transition, queuedSample);
        };
      }

      if (i === queuedSamples.length - 1 && sample) {
        sample.source.onended = onEndedCallbackFn;
      }

      lastSample = sample;
    });
  }

  public previewBeatsWithOrders(
    beforeOriginBeatOrders: number[],
    originBeatOrder: number,
    destinationBeatOrder: number,
    afterDestinationBeatOrders: number[],
    onEndedCallbackFn: () => void,
  ) {
    function createBeatBatch(track: TrackModel, beatOrders: number[], branch: BranchModel | null): BeatBatch {
      const originTrackBeats = beatOrders.map(beatOrder => beats[beatOrder]);

      return {
        track,
        originTrackBeats,
        action: branch,
      };
    }

    const branchType = originBeatOrder < destinationBeatOrder ? BranchType.FORWARD : BranchType.BACKWARD;
    const beats = this._playingTrack.beats;
    const branch = branchFactory.createBranchFromType(this._playingTrack,
                                                      branchType,
                                                      beats[originBeatOrder],
                                                      beats[destinationBeatOrder]);

    // Stop the audio, move the playing Needle to where we will start from
    const resetPercentage = beats[beforeOriginBeatOrders[0]].getPercentageInTrack(this._playingTrack.duration);
    this.stop(resetPercentage);

    // Preview everything up to, and including, the origin beat
    const firstBeatBatch = createBeatBatch(this._playingTrack, [...beforeOriginBeatOrders, originBeatOrder], branch);
    this.queueBeatsForPlaying(
      firstBeatBatch,
      NeedleType.BRANCH_NAV,
      () => {},
    );

    // Preview everything after the destination beat
    const secondBeatBatch = createBeatBatch(this._playingTrack, afterDestinationBeatOrders, null);
    this.queueBeatsForPlaying(
      secondBeatBatch,
      NeedleType.BRANCH_NAV,
      onEndedCallbackFn,
    );
  }

  private playSample(
    track: TrackModel,
    queuedSample: QueuedSampleModel,
    when?: number,
    offset?: number,
    duration?: number,
    onStartedFn?: (() => void) | null,
  ): Sample {
    const audioBuffer = this.getAudioBuffer(track);
    const source = this._audioContext.createBufferSource();

    source.buffer = audioBuffer;

    if (fyp.shouldPlayMusic) {
      source.connect(this._audioContext.destination);
    } else {
      const gainNode = this._audioContext.createGain();
      gainNode.gain.setValueAtTime(0, 0);

      source.connect(gainNode);
      gainNode.connect(this._audioContext.destination);
    }

    source.start(when, offset, duration);

    let onStartedTimer;
    if (onStartedFn) {
      onStartedTimer = setTimeout(() => {
        onStartedFn();
      }, conversions.secsToMs(when - this._audioContext.currentTime));
    }

    const sample: Sample = {
      onStartedTimer,
      queuedSample,
      source,
    };

    this._samples.push(sample);

    return sample;
  }

  private getAudioBuffer({ ID }: TrackModel): AudioBuffer {
    return this._audioBuffers[ID];
  }

  /**
   * @param resetPercentage Where to move the NeedleType.PLAYING after the audio is stopped
   *                        Leaving this value as null will not change the position
   */
  public stop(resetPercentage: number = null) {
    // Stop all queued samples, then clear them from memory
    this._samples.forEach(({ source, onStartedTimer }) => {
      source.onended = null;
      source.stop();
      clearTimeout(onStartedTimer);
    });
    this._samples = [];

    SampleQueueManager.clear();

    this.dispatchBeatBatchStopped(resetPercentage);
  }

  public seek(percentage: number) {
    const playingQueuedSample: QueuedSampleModel | null = SampleQueueManager.clearFuture(this._audioContext);

    if (playingQueuedSample) {
      this._samples = this._samples.filter((sample) => {
        sample.source.onended = null;
        clearTimeout(sample.onStartedTimer);
        delete sample.onStartedTimer;

        if (sample.queuedSample.uuid !== playingQueuedSample.uuid) {
          sample.source.stop();
          return false;
        }

        return true;
      });
    } else {
      this._samples = [];
    }

    const track = this._playingTrack;
    const playthroughMs = track.duration.ms * conversions.percentageToDecimal(percentage);

    this.dispatchBeatBatchRequested(track, null, playthroughMs, config.audio.schedulingAheadCount);
  }

  private dispatchTrackChangeReady(track: TrackModel) {
    Dispatcher.getInstance()
              .dispatch(FYPEvent.TrackChangeReady, {
                track,
              } as FYPEventPayload['TrackChangeReady']);
  }

  private dispatchTrackChanging(
    { destinationTrack, transitionInEntryOffset }: SongTransitionModel,
    transitionSample: QueuedSampleModel,
  ) {
    const { durationMs, originTrackBeatsDurationSecs, destinationTrackBeatsDurationSecs } = transitionSample;

    const transitionDurationMs = Math.max(durationMs, config.drawables.songCircle.minTransitionDurationMs);
    const transitionOutStartMs = 0;
    const transitionOutDurationMs = conversions.secsToMs(originTrackBeatsDurationSecs);
    const transitionInStartMs =  transitionInEntryOffset.ms;
    const transitionInDurationMs = conversions.secsToMs(destinationTrackBeatsDurationSecs);

    setTimeout(() => {
      this.changePlayingTrack();
    }, transitionDurationMs);

    Dispatcher.getInstance()
              .dispatch(FYPEvent.TrackChanging, {
                destinationTrack,
                transitionDurationMs,
                transitionOutStartMs,
                transitionOutDurationMs,
                transitionInStartMs,
                transitionInDurationMs,
              } as FYPEventPayload['TrackChanging']);
  }

  private dispatchTrackChanged(track: TrackModel) {
    Dispatcher.getInstance()
              .dispatch(FYPEvent.TrackChanged, {
                track,
              } as FYPEventPayload['TrackChanged']);
  }

  private dispatchBeatBatchRequested(
    track: TrackModel,
    action: ActionModel | null, // null if start of song
    fromMs?: number,
    beatBatchCount: number = 1,
  ) {
    Dispatcher.getInstance()
              .dispatch(FYPEvent.BeatBatchRequested, {
                track,
                action,
                beatBatchCount,
                fromMs,
              } as FYPEventPayload['BeatBatchRequested']);
  }

  /**
   * Dispatch FYPEvent.BeatBatchPlaying, to let other services know that
   * we're playing beats up to a branch origin.
   *
   * This is used in the CanvasService, to start the canvas rotation.
   *
   * @param queuedSampleBatch The samples within a batch
   * @param source Who made the request
   */
  private dispatchBeatBatchPlaying(
    { action: nextAction, queuedSamplesToNextOriginBeat: samples }: QueuedSampleBatch,
    source: NeedleType,
  ) {
    const startBeat = SampleQueueManager.getFirstBeatInSamples(samples);
    const endBeat = SampleQueueManager.getLastBeatInSamples(samples);
    const songDuration = this._playingTrack.duration;
    const startPercentage = startBeat.getPercentageInTrack(songDuration);
    const endPercentage = endBeat.getPercentageInTrack(songDuration);
    const durationMs = endBeat.endMs - startBeat.startMs;

    Dispatcher.getInstance()
              .dispatch(FYPEvent.BeatBatchPlaying, {
                nextAction,
                startPercentage,
                endPercentage,
                durationMs,
                source,
              } as FYPEventPayload['BeatBatchPlaying']);
  }

  private dispatchBeatBatchStopped(resetPercentage: number | null) {
    Dispatcher.getInstance()
              .dispatch(FYPEvent.BeatBatchStopped, {
                resetPercentage,
              } as FYPEventPayload['BeatBatchStopped']);
  }
}

export default WebAudioService;
