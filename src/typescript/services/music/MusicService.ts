import Track from '../../models/audio-analysis/Track';
import { GetATrack } from '../api/spotify/tracks';
import Dispatcher from '../../events/Dispatcher';

/**
 * Initial Music Setup
 */

class MusicService {
  private static _instance: MusicService;

  private tracks: Track[] = [];
  private playingTrackID: string = null;
  private childTrackIDs: Set<string> = new Set<string>();

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
    const trackRequests: Promise<Track>[] = trackIDs.map(ID => GetATrack.request(ID));

    Promise
      .all(trackRequests)
      .then((tracks) => {
        const childTrackIDs = tracks.map(track => track.getID());
        const playingTrackID = tracks[0].getID();

        this.tracks = tracks;
        this.addChildTracks(...childTrackIDs);
        this.setPlayingTrack(playingTrackID);
      });
  }

  public static getInstance(): MusicService {
    return this._instance || (this._instance = new this());
  }

  public addChildTracks(...trackIDs: string[]) {
    trackIDs.forEach(ID => this.childTrackIDs.add(ID));
  }

  public getTracks(): Track[] {
    return this.tracks;
  }

  public getTrack(ID: string): Track {
    const tracks = this.tracks;

    return tracks.find(track => track.getID() === ID);
  }

  public getPlayingTrack(): Track | null {
    const tracks = this.tracks;
    const playingTrackID = this.playingTrackID;
    const playingTrack = tracks.find(track => track.getID() === playingTrackID) || null;

    return playingTrack;
  }

  public setPlayingTrack(ID: string) {
    const previousPlayingTrack: Track | null = this.getPlayingTrack();

    if (previousPlayingTrack) {
      this.childTrackIDs.add(previousPlayingTrack.getID());
    }

    this.childTrackIDs.delete(ID);
    this.playingTrackID = ID;

    Dispatcher.getInstance().dispatch('PlayingTrackChanged', {
      playingTrack: this.getPlayingTrack(),
      childTracks: this.getChildTracks(),
    });
  }

  public getChildTracks() {
    const tracks = this.tracks;
    const childTrackIDs = this.childTrackIDs;
    const childTracks = tracks.filter(track => childTrackIDs.has(track.getID()));

    return childTracks;
  }
}

export default MusicService;
