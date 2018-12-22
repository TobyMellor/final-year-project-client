import TrackModel from '../../models/audio-analysis/Track';
import Dispatcher from '../../events/Dispatcher';
import * as trackFactory from '../../factories/track';

/**
 * Initial Music Setup
 */

class MusicService {
  private static _instance: MusicService;

  private tracks: TrackModel[] = [];
  private playingTrack: TrackModel = null;
  private childTracks: Set<TrackModel> = new Set<TrackModel>();

  private constructor() {
    // AJAX requests for spotify data
    // Analyse beats and bars

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
        const childTracks = tracks;
        const playingTrack = childTracks.shift();

        this.tracks = tracks;
        this.addChildTracks(...childTracks);
        this.setPlayingTrack(playingTrack);
      });
  }

  public static getInstance(): MusicService {
    return this._instance || (this._instance = new this());
  }

  public addChildTracks(...tracks: TrackModel[]) {
    tracks.forEach(track => this.childTracks.add(track));
  }

  public getTracks(): TrackModel[] {
    return this.tracks;
  }

  public getTrack(ID: string): TrackModel {
    const tracks = this.tracks;

    return tracks.find(track => track.getID() === ID);
  }

  public getPlayingTrack(): TrackModel | null {
    return this.playingTrack;
  }

  public async setPlayingTrack(track: TrackModel) {
    const previousPlayingTrack: TrackModel | null = this.getPlayingTrack();

    // Load in the AudioAnalysis and AudioFeatures for the track we're
    // about to play
    await trackFactory.addAudioAnalysis(track);
    await trackFactory.addAudioFeatures(track);

    if (previousPlayingTrack) {
      this.childTracks.add(previousPlayingTrack);
    }

    this.childTracks.delete(track);
    this.playingTrack = track;

    Dispatcher.getInstance()
              .dispatch('PlayingTrackChanged', {
                playingTrack: this.getPlayingTrack(),
                childTracks: this.getChildTracks(),
              });
  }

  public getChildTracks() {
    return this.childTracks;
  }
}

export default MusicService;
