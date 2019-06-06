import Request from '../Request';
import { GetAnArtistResponse } from '../../../types/spotify-responses';
import ArtistModel from '../../../models/Artist';
import API from '../API';
import SpotifyRequest from './SpotifyRequest';

class GetAnArtist extends SpotifyRequest {
  private id: number;

  constructor(id: number) {
    super();
    this.id = id;
  }

  static async request(id: number): Promise<ArtistModel> {
    const response: any = <GetAnArtistResponse> await API.get(
      new GetAnArtist(id),
    );

    return new ArtistModel(response.data);
  }

  async mockResponse(): Promise<ArtistModel> {
    return require('../mocks/spotify/artists').getAnArtistMock();
  }

  getEndpoint() {
    return `${this.baseURL}/artists/${this.id}`;
  }
}

export default GetAnArtist;
