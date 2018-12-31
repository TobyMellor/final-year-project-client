import SpotifyAPI from './SpotifyAPI';
import Request from '../Request';
import { GetAnArtistResponse } from '../../../types/spotify-responses';
import ArtistModel from '../../../models/Artist';

class GetAnArtist extends Request {
  private id: number;

  constructor(id: number) {
    super();

    this.id = id;
  }

  static async request(id: number): Promise<ArtistModel> {
    const response = <GetAnArtistResponse> await SpotifyAPI.get(
      new GetAnArtist(id),
    );

    return new ArtistModel(response);
  }

  async mockResponse(): Promise<ArtistModel> {
    return require('../mocks/spotify/artists').getAnArtistMock();
  }

  getEndpoint() {
    return `artists/${this.id}`;
  }
}

export default GetAnArtist;
