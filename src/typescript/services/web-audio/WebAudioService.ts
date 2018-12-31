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
import QueuedBeatModel from '../../models/web-audio/QueuedBeat';
import BeatQueueManager from './BeatQueueManager';

class WebAudioService {
  private static _instance: WebAudioService;

  private audioContext: AudioContext;
  private audioBuffer: AudioBuffer;

  private tracks: TrackModel[] = [];
  private playingTrack: TrackModel = null;
  private childTracks: Set<TrackModel> = new Set<TrackModel>();

  private constructor() {
    const AudioContext = (<any> window).AudioContext || (<any> window).webkitAudioContext;

    this.audioContext = new AudioContext();

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
        this.tracks = tracks;
        this.addChildTracks(...tracks);
        this.setPlayingTrack(tracks[0]);
      });

    // Once we've loaded the track, analyzed it, and rendered the visuals
    Dispatcher.getInstance()
              .on(FYPEvent.PlayingTrackRendered, this, this.loadPlayingTrack);

    // When the Branch Service has given us new beats
    Dispatcher.getInstance()
              .on(FYPEvent.BeatsReadyForQueueing, this, this.queueBeatsForPlaying);
  }

  public static getInstance(): WebAudioService {
    return this._instance || (this._instance = new this());
  }

  public addChildTracks(...tracks: TrackModel[]) {
    tracks.forEach(track => this.childTracks.add(track));
  }

  public getTracks(): TrackModel[] {
    return this.tracks;
  }

  public getTrack(ID: string): TrackModel | null {
    const tracks = this.tracks;

    return tracks.find(track => track.getID() === ID) || null;
  }

  public getPlayingTrack(): TrackModel | null {
    return this.playingTrack;
  }

  public async setPlayingTrack(track: TrackModel) {
    const previousPlayingTrack: TrackModel | null = this.getPlayingTrack();

    if (previousPlayingTrack) {
      this.childTracks.add(previousPlayingTrack);
    }

    this.childTracks.delete(track);
    this.playingTrack = track;

    Dispatcher.getInstance()
              .dispatch(FYPEvent.PlayingTrackChanged, {
                playingTrack: this.playingTrack,
                childTracks: this.childTracks,
              });
  }

  public getChildTracks() {
    return this.childTracks;
  }

  private async loadPlayingTrack() {
    const trackID = this.playingTrack.getID();

    // Get the Audio Buffer for the corresponding mp3 file
    const response = await fetch(`tracks/${trackID}.mp3`);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    this.audioBuffer = audioBuffer;

    const SCHEDULE_BUFFER_COUNT = 2;
    this.dispatchNextBeatsRequest(SCHEDULE_BUFFER_COUNT);
  }

  private async queueBeatsForPlaying({ beats }: { beats: BeatModel[] }) {
    if (!beats || beats.length === 0) {
      throw new Error('Attempted to request no beats!');
    }

    const queuedBeats = BeatQueueManager.add(this.audioContext, beats);
    let lastBufferSource: AudioBufferSourceNode;

    queuedBeats.forEach((queuedBeat) => {
      const beat = queuedBeat.getBeat();

      lastBufferSource = this.playSample(this.audioBuffer,
                                         queuedBeat.getSubmittedCurrentTime(),
                                         beat.getStart().secs,
                                         beat.getDuration().secs);
    });

    lastBufferSource.onended = () => {
      this.dispatchNextBeatsRequest();
    };
  }

  private playSample(
    audioBuffer: AudioBuffer,
    when?: number,
    offset?: number,
    duration?: number,
  ): AudioBufferSourceNode {
    const source = this.audioContext.createBufferSource();

    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);
    source.start(when, offset, duration);

    return source;
  }

  // Signal that we're ready to receive beats to play
  private dispatchNextBeatsRequest(beatBatchCount = 1) {
    Dispatcher.getInstance()
              .dispatch(FYPEvent.NextBeatsRequested, {
                beatBatchCount,
                playingTrack: this.playingTrack,
              });
  }
}

export default WebAudioService;
