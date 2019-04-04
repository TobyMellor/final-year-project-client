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
import { FYPEvent } from '../../types/enums';
import BeatQueueManager from './BeatQueueManager';
import config from '../../config';
import { FYPEventPayload } from '../../types/general';
import QueuedBeatModel from '../../models/web-audio/QueuedBeat';
import * as utils from '../../utils/conversions';
import BranchModel from '../../models/branches/Branch';

class WebAudioService {
  private static _instance: WebAudioService;

  private _audioContext: AudioContext;
  private _audioBuffer: AudioBuffer;
  private _audioBufferSourceNodes: AudioBufferSourceNode[] = [];

  private _tracks: TrackModel[] = [];
  private _playingTrack: TrackModel = null;
  private _childTracks: Set<TrackModel> = new Set<TrackModel>();

  private constructor() {
    const AudioContext = (<any> window).AudioContext || (<any> window).webkitAudioContext;

    this._audioContext = new AudioContext();

    const trackIDs: string[] = [
      '3O8NlPh2LByMU9lSRSHedm', // Controlla
      '4RVbK6cV0VqWdpCDcx3hiT', // Reborn
      '6wVWJl64yoTzU27EI8ep20', // Crying Lightning
      '3aUFrxO1B8EW63QchEl3wX',
      '2hmHlBM0kPBm17Y7nVIW9f',
      // '0wwPcA6wtMf6HUMpIRdeP7',
    ];
    const trackRequests: Promise<TrackModel>[] = trackIDs.map(ID => trackFactory.createTrack(ID));

    Promise
      .all(trackRequests)
      .then((tracks) => {
        this._tracks = tracks;
        this.addChildTracks(...tracks);
        this.setPlayingTrack(tracks[0]);
      });

    // Once we've loaded the track, analyzed it, and rendered the visuals
    Dispatcher.getInstance()
              .on(FYPEvent.PlayingTrackRendered, this, this.loadPlayingTrack);

    if (config.fyp.shouldPlayMusic) {
      // When the Branch Service has given us new beats
      Dispatcher.getInstance()
                .on(FYPEvent.BeatsReadyForQueueing, this, this.queueBeatsForPlaying);
    }
  }

  public static getInstance(): WebAudioService {
    return this._instance || (this._instance = new this());
  }

  public addChildTracks(...tracks: TrackModel[]) {
    tracks.forEach(track => this._childTracks.add(track));
  }

  public getTrack(ID: string): TrackModel | null {
    const tracks = this._tracks;

    return tracks.find(track => track.ID === ID) || null;
  }

  public getPlayingTrack(): TrackModel | null {
    return this._playingTrack;
  }

  public async setPlayingTrack(track: TrackModel) {
    const previousPlayingTrack: TrackModel | null = this._playingTrack;

    if (previousPlayingTrack) {
      this._childTracks.add(previousPlayingTrack);
    }

    this._childTracks.delete(track);
    this._playingTrack = track;

    Dispatcher.getInstance()
              .dispatch(FYPEvent.PlayingTrackChanged, {
                playingTrack: this._playingTrack,
                childTracks: this._childTracks,
              });
  }

  private async loadPlayingTrack() {
    const trackID = this._playingTrack.ID;

    // Get the Audio Buffer for the corresponding mp3 file
    const response = await fetch(`tracks/${trackID}.mp3`);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this._audioContext.decodeAudioData(arrayBuffer);

    this._audioBuffer = audioBuffer;

    const SCHEDULE_BUFFER_COUNT = 2;
    this.dispatchNextBeatsRequest(null, SCHEDULE_BUFFER_COUNT);
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
    { beatBatch }: FYPEventPayload['BeatsReadyForQueueing'],
    onEndedCallbackFn?: () => void,
  ) {
    if (!beatBatch || !beatBatch.beatsToBranchOrigin || beatBatch.beatsToBranchOrigin.length === 0) {
      throw new Error('Attempted to request no beats!');
    }

    const queuedBeatBatch = BeatQueueManager.add(this._audioContext, beatBatch);
    let lastBufferSource: AudioBufferSourceNode;

    // When the first beat has started, we want to dispatch the "PlayingBeatBatch" event
    const onStartedFn = () => this.dispatchPlayingBeatBatch(queuedBeatBatch.beatsToBranchOrigin[0],
                                                            queuedBeatBatch.branch);

    queuedBeatBatch.beatsToBranchOrigin.forEach((queuedBeat, i) => {
      const { startSecs, durationSecs } = queuedBeat.beat;

      lastBufferSource = this.playSample(this._audioBuffer,
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

        this.dispatchNextBeatsRequest(nextBranch);
      };
    }
  }

  public async previewBeatsWithOrders(beatOrders: number[], beatOnEndedCallbackFn: () => void) {
    const previewingBeats = await this._playingTrack.getBeatsWithOrders(beatOrders);

    this.stop();

    return this.queueBeatsForPlaying(
      { beats: previewingBeats, beatBatch: null },
      beatOnEndedCallbackFn,
    );
  }

  private playSample(
    audioBuffer: AudioBuffer,
    when?: number,
    offset?: number,
    duration?: number,
    onStartedFn?: (() => void) | null,
  ): AudioBufferSourceNode {
    const source = this._audioContext.createBufferSource();

    source.buffer = audioBuffer;
    source.connect(this._audioContext.destination);
    source.start(when, offset, duration);

    if (onStartedFn) {
      setTimeout(onStartedFn,
                 utils.secondsToMilliseconds(when - this._audioContext.currentTime));
    }

    this._audioBufferSourceNodes.push(source);

    return source;
  }

  public stop() {
    // Stop all queued samples, then clear them from memory
    this._audioBufferSourceNodes.forEach(source => source.stop());
    this._audioBufferSourceNodes = [];

    BeatQueueManager.clear();
  }

  // Signal that we're ready to receive beats to play
  private dispatchNextBeatsRequest(
    branch: BranchModel | null, // null if start of song
    beatBatchCount: number = 1,
  ) {
    Dispatcher.getInstance()
              .dispatch(FYPEvent.NextBeatsRequested, {
                beatBatchCount,
                branch,
                playingTrack: this._playingTrack,
              });
  }

  /**
   * Dispatch FYPEvent.PlayingBeatBatch, to let other services know that
   * we're playing beats up to a branch origin.
   *
   * This is used in the CanvasService, to start the canvas rotation.
   *
   * @param startQueuedBeat The start beat of the batch
   * @param endQueuedBeat The origin beat of a branch
   */
  private dispatchPlayingBeatBatch(
    { beat: startBeat }: QueuedBeatModel,
    nextBranch: BranchModel,
  ) {
    const endBeat = nextBranch.originBeat;
    const songDuration = this._playingTrack.duration;
    const startPercentage = startBeat.getPercentageInTrack(songDuration);
    const endPercentage = endBeat.getPercentageInTrack(songDuration);
    const durationMs = endBeat.startMs - startBeat.endMs; // TODO: Check endMs and startMs usage

    Dispatcher.getInstance()
              .dispatch(FYPEvent.PlayingBeatBatch, {
                nextBranch,
                startPercentage,
                endPercentage,
                durationMs,
              });
  }
}

export default WebAudioService;
