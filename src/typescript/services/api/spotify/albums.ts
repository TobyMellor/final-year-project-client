import AlbumModel from '../../../models/Album';
import Request from '../Request';
import { GetAnAlbumSuccessResponse } from '../../../types/spotify-responses';
import API from '../API';
import SpotifyRequest from './SpotifyRequest';

class GetAnAlbum extends SpotifyRequest {
  private id: number;

  constructor(id: number) {
    super();

    this.id = id;
  }

  static async request(id: number): Promise<AlbumModel> {
    const response = <GetAnAlbumSuccessResponse> await API.get(
      new GetAnAlbum(id),
    );

    return new AlbumModel(response.data);
  }

  async mockResponse(): Promise<AlbumModel> {
    return require('../mocks/spotify/albums').getAnAlbumMock();
  }

  getEndpoint() {
    return `${this.baseURL}/albums/${this.id}`;
  }
}

export default GetAnAlbum;
