import SpotifyAPI from './SpotifyAPI';
import Request from '../Request';
import { GetATrackResponse } from '../../../types/spotify-responses';
import Track from '../../../models/Track';

export class GetATrack extends Request {
  private id: number;

  constructor(id: number) {
    super();

    this.id = id;
  }

  static async request(id: number): Promise<Track> {
    const response = <GetATrackResponse> await SpotifyAPI.get(
      new GetATrack(id),
    );

    return new Track(response);
  }

  async mockResponse(): Promise<Track> {
    return require('../mocks/spotify/tracks').getATrackMock();
  }

  getEndpoint() {
    return `tracks/${this.id}`;
  }
}
