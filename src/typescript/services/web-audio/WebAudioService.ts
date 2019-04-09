/**
 * Music Service
 *
 * Handles:
 *  - Loading of tracks
 *  - Initially playing a track
 *  - Executing the Seek Queue
 */

import TrackModel from '../../models/audio-analysis/Track';
import Dispatcher from '../../events/Dispatcher';
import * as trackFactory from '../../factories/track';
import { FYPEvent, NeedleType, BranchType } from '../../types/enums';
import BeatQueueManager from './BeatQueueManager';
import { FYPEventPayload, BeatBatch, QueuedBeatBatch } from '../../types/general';
import * as utils from '../../utils/conversions';
import BranchModel from '../../models/branches/Branch';
import fyp from '../../config/fyp';
import * as branchFactory from '../../factories/branch';

class WebAudioService {
  private static _instance: WebAudioService;

  private _audioContext: AudioContext;
  private _audioBuffers: { [trackID: string]: AudioBuffer };
  private _nextTrackAudioBufferPromise: Promise<AudioBuffer>;
  private _audioBufferSourceNodes: Set<AudioBufferSourceNode> = new Set();

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
    //   '0wwPcA6wtMf6HUMpIRdeP7',

    Dispatcher.getInstance()
              .on(FYPEvent.TrackChangeRequested, data => this.startLoadingNextTrack(data));

    // Once we've loaded the track and analyzed it
    Dispatcher.getInstance()
              .on(FYPEvent.BranchesAnalyzed, () => this.finishLoadingNextTrack());

    // When the Branch Service has given us new beats
    Dispatcher.getInstance()
              .on(FYPEvent.BeatBatchReady, data => this.queueBeatsForPlaying(data));

    const initialTrackID = '4RVbK6cV0VqWdpCDcx3hiT'; // TODO: Replace dynamically
    trackFactory.createTrack(initialTrackID)
                .then((initialTrack: TrackModel) => {
                  Dispatcher.getInstance()
                            .dispatch(FYPEvent.TrackChangeRequested, {
                              track: initialTrack,
                            });
                });
  }

  public static getInstance(): WebAudioService {
    return this._instance || (this._instance = new this());
  }

  private startLoadingNextTrack({ track }: FYPEventPayload['TrackChangeRequested']) {
    this._nextTrack = track;

    async function getAudioBuffer(trackID: string) {
      // Get the Audio Buffer for the corresponding mp3 file
      const response = await fetch(`tracks/${track.ID}.mp3`);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this._audioContext.decodeAudioData(arrayBuffer);

      return audioBuffer;
    }

    this._nextTrackAudioBufferPromise = getAudioBuffer(track.ID);
  }

  private async finishLoadingNextTrack() {
    if (!this._nextTrack || !this._nextTrackAudioBufferPromise) {
      throw new Error('You must start loading the next track through startLoadingNextTrack!');
    }

    const nextTrackID = this._nextTrack.ID;
    this._audioBuffers[nextTrackID] = await this._nextTrackAudioBufferPromise;
    this._nextTrackAudioBufferPromise = null;

    // If we've not played anything yet, we can transition immediately
    if (!this._playingTrack) {
      this.changePlayingTrack();
      return;
    }

    // Signal to the ActionDecider that we can now take the transition
    this.dispatchTrackChangeReady();
  }

  private changePlayingTrack() {
    this._playingTrack = this._nextTrack;
    this._nextTrack = null;

    const SCHEDULE_BUFFER_COUNT = 2;
    this.dispatchBeatBatchRequested(null, SCHEDULE_BUFFER_COUNT);
  }

  public getPlayingTrack(): TrackModel | null {
    return this._playingTrack;
  }

  /**
   * When we receive some beats, add the beats to the BeatQueueManager's queue.
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
    { beatBatch }: FYPEventPayload['BeatBatchReady'],
    source: NeedleType = NeedleType.PLAYING,
    onEndedCallbackFn?: () => void,
  ) {
    if (!beatBatch || !beatBatch.beatsToBranchOrigin || beatBatch.beatsToBranchOrigin.length === 0) {
      throw new Error('Attempted to request no beats!');
    }

    const queuedBeatBatch = BeatQueueManager.add(this._audioContext, beatBatch);
    let lastBufferSource: AudioBufferSourceNode;

    // When the first beat has started, we want to dispatch the "BeatBatchPlaying" event
    const onStartedFn = () => this.dispatchBeatBatchPlaying(queuedBeatBatch, source);

    queuedBeatBatch.queuedBeatsToBranchOrigin.forEach((queuedBeat, i) => {
      const { startSecs, durationSecs } = queuedBeat.beat;

      lastBufferSource = this.playSample(beatBatch.track,
                                         queuedBeat.submittedCurrentTime,
                                         startSecs,
                                         durationSecs,
                                         i === 0 && onStartedFn);
    });

    if (onEndedCallbackFn) {
      // Custom onended: e.g. UI branch previewing
      lastBufferSource.onended = onEndedCallbackFn;
    } else {
      // Default onended: Request next batch of beats
      lastBufferSource.onended = () => {
        // The next branch that we need to queue beats from
        const nextBranch = BeatQueueManager.lastBranch();

        this.dispatchBeatBatchRequested(nextBranch);
      };
    }
  }

  public async previewBeatsWithOrders(
    beforeOriginBeatOrders: number[],
    originBeatOrder: number,
    destinationBeatOrder: number,
    afterDestinationBeatOrders: number[],
    onEndedCallbackFn: () => void,
  ) {
    function createBeatBatch(beatOrders: number[], branch: BranchModel | null): BeatBatch {
      const beatsToBranchOrigin = beatOrders.map(beatOrder => beats[beatOrder]);

      return {
        beatsToBranchOrigin,
        branch,
        track: this._playingTrack,
      };
    }

    const branchType = originBeatOrder < destinationBeatOrder ? BranchType.FORWARD : BranchType.BACKWARD;
    const beats = await this._playingTrack.getBeats();
    const branch = branchFactory.createBranchFromType(branchType, beats[originBeatOrder], beats[destinationBeatOrder]);

    // Stop the audio, move the playing Needle to where we will start from
    const resetPercentage = beats[beforeOriginBeatOrders[0]].getPercentageInTrack(this._playingTrack.duration);
    this.stop(resetPercentage);

    // Preview everything up to, and including, the origin beat
    const firstBeatBatch = createBeatBatch([...beforeOriginBeatOrders, originBeatOrder], branch);
    this.queueBeatsForPlaying(
      { beatBatch: firstBeatBatch },
      NeedleType.BRANCH_NAV,
      () => {},
    );

    // Preview everything after the destination beat
    const secondBeatBatch = createBeatBatch(afterDestinationBeatOrders, null);
    this.queueBeatsForPlaying(
      { beatBatch: secondBeatBatch },
      NeedleType.BRANCH_NAV,
      onEndedCallbackFn,
    );
  }

  private playSample(
    track: TrackModel,
    when?: number,
    offset?: number,
    duration?: number,
    onStartedFn?: (() => void) | null,
  ): AudioBufferSourceNode {
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

    if (onStartedFn) {
      setTimeout(() => {
        // If we've called this.stop(), don't request more beats.
        if (!this._audioBufferSourceNodes.has(source)) {
          return;
        }

        onStartedFn();
      }, utils.secondsToMilliseconds(when - this._audioContext.currentTime));
    }

    this._audioBufferSourceNodes.add(source);

    return source;
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
    this._audioBufferSourceNodes.forEach((source) => {
      source.onended = null;
      source.stop();
    });
    this._audioBufferSourceNodes.clear();

    BeatQueueManager.clear();

    this.dispatchBeatBatchStopped(resetPercentage);
  }

  private dispatchTrackChangeReady() {
    Dispatcher.getInstance()
              .dispatch(FYPEvent.TrackChangeReady);
  }

  private dispatchTrackChanged() {
    Dispatcher.getInstance()
              .dispatch(FYPEvent.TrackChanged);
  }

  private dispatchBeatBatchRequested(
    branch: BranchModel | null, // null if start of song
    beatBatchCount: number = 1,
  ) {
    Dispatcher.getInstance()
              .dispatch(FYPEvent.BeatBatchRequested, {
                beatBatchCount,
                branch,
                playingTrack: this._playingTrack,
              });
  }

  /**
   * Dispatch FYPEvent.BeatBatchPlaying, to let other services know that
   * we're playing beats up to a branch origin.
   *
   * This is used in the CanvasService, to start the canvas rotation.
   *
   * @param startQueuedBeat The start beat of the batch
   * @param endQueuedBeat The origin beat of a branch
   * @param source Who made the request
   */
  private dispatchBeatBatchPlaying(
    { branch: nextBranch, queuedBeatsToBranchOrigin: beats }: QueuedBeatBatch,
    source: NeedleType,
  ) {
    const startBeat = beats[0].beat;
    const endBeat = beats[beats.length - 1].beat;
    const songDuration = this._playingTrack.duration;
    const startPercentage = startBeat.getPercentageInTrack(songDuration);
    const endPercentage = endBeat.getPercentageInTrack(songDuration);
    const durationMs = endBeat.endMs - startBeat.startMs;

    Dispatcher.getInstance()
              .dispatch(FYPEvent.BeatBatchPlaying, {
                nextBranch,
                startPercentage,
                endPercentage,
                durationMs,
                source,
              });
  }

  private dispatchBeatBatchStopped(resetPercentage: number | null) {
    Dispatcher.getInstance()
              .dispatch(FYPEvent.BeatBatchStopped, {
                resetPercentage,
              });
  }
}

export default WebAudioService;
