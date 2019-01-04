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
import BeatModel from '../../models/audio-analysis/Beat';
import BeatQueueManager from './BeatQueueManager';
import config from '../../config';

class WebAudioService {
  private static _instance: WebAudioService;

  private _audioContext: AudioContext;
  private _audioBuffer: AudioBuffer;

  private _tracks: TrackModel[] = [];
  private _playingTrack: TrackModel = null;
  private _childTracks: Set<TrackModel> = new Set<TrackModel>();

  private constructor() {
    const AudioContext = (<any> window).AudioContext || (<any> window).webkitAudioContext;

    this._audioContext = new AudioContext();

    const trackIDs: string[] = [
      '4RVbK6cV0VqWdpCDcx3hiT',
      '3aUFrxO1B8EW63QchEl3wX',
      '2hmHlBM0kPBm17Y7nVIW9f',
      '6wVWJl64yoTzU27EI8ep20',
      '3O8NlPh2LByMU9lSRSHedm',
      '0wwPcA6wtMf6HUMpIRdeP7',
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

  private async queueBeatsForPlaying(
    { beats }: { beats: BeatModel[] },
    onEndedCallbackFn?: () => void,
  ) {
    if (!beats || beats.length === 0) {
      throw new Error('Attempted to request no beats!');
    }

    const queuedBeats = BeatQueueManager.add(this._audioContext, beats);
    let lastBufferSource: AudioBufferSourceNode;

    queuedBeats.forEach((queuedBeat) => {
      const { startSecs, durationSecs } = queuedBeat.getBeat();

      lastBufferSource = this.playSample(this._audioBuffer,
                                         queuedBeat.getSubmittedCurrentTime(),
                                         startSecs,
                                         durationSecs);
    });

    if (onEndedCallbackFn) {

      // Custom onended: e.g. UI branch previewing
      lastBufferSource.onended = onEndedCallbackFn;
    } else {

      // Default onended: Request next batch of beats
      lastBufferSource.onended = () => {
        const lastQueuedBeat = BeatQueueManager.last().getBeat();

        this.dispatchNextBeatsRequest(lastQueuedBeat);
      };
    }
  }

  public async previewBeatsWithOrders(beatOrders: number[], beatOnEndedCallbackFn: () => void) {
    const previewingBeats = await this._playingTrack.getBeatsWithOrders(beatOrders);

    BeatQueueManager.clear();

    return this.queueBeatsForPlaying({ beats: previewingBeats }, beatOnEndedCallbackFn);
  }

  private playSample(
    audioBuffer: AudioBuffer,
    when?: number,
    offset?: number,
    duration?: number,
  ): AudioBufferSourceNode {
    const source = this._audioContext.createBufferSource();

    source.buffer = audioBuffer;
    source.connect(this._audioContext.destination);
    source.start(when, offset, duration);

    return source;
  }

  // Signal that we're ready to receive beats to play
  private dispatchNextBeatsRequest(lastQueuedBeat: BeatModel | null, beatBatchCount: number = 1) {
    Dispatcher.getInstance()
              .dispatch(FYPEvent.NextBeatsRequested, {
                beatBatchCount,
                lastQueuedBeat,
                playingTrack: this._playingTrack,
              });
  }
}

export default WebAudioService;
