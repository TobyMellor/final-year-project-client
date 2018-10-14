import SpotifyAPI from './SpotifyAPI';
import Request from '../Request';
import { GetAnArtistResponse } from '../../../types/spotify-responses';
import Artist from '../../../models/Artist';

export class GetAnArtist extends Request {
  private id: number;

  constructor(id: number) {
    super();

    this.id = id;
  }

  static async request(id: number): Promise<Artist> {
    const response = <GetAnArtistResponse> await SpotifyAPI.get(
      new GetAnArtist(id),
    );

    return new Artist(response);
  }

  async mockResponse(): Promise<Artist> {
    return require('../mocks/spotify/artists').getAnArtistMock();
  }

  getEndpoint() {
    return `artists/${this.id}`;
  }
}
