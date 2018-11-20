import SpotifyAPI from './SpotifyAPI';
import Request from '../Request';
import { GetATrackResponse } from '../../../types/spotify-responses';
import Track from '../../../models/audio-analysis/Track';

export class GetATrack extends Request {
  private ID: string;

  constructor(ID: string) {
    super();

    this.ID = ID;
  }

  static async request(ID: string): Promise<Track> {
    const response = <GetATrackResponse> await SpotifyAPI.get(
      new GetATrack(ID),
    );

    return new Track(response);
  }

  async mockResponse(): Promise<Track> {
    return require('../mocks/spotify/tracks').getATrackMock(this.ID);
  }

  getEndpoint() {
    return `tracks/${this.ID}`;
  }
}
