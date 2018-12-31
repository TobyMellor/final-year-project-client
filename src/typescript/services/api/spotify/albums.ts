import AlbumModel from '../../../models/Album';
import SpotifyAPI from './SpotifyAPI';
import Request from '../Request';
import { GetAnAlbumResponse } from '../../../types/spotify-responses';

class GetAnAlbum extends Request {
  private id: number;

  constructor(id: number) {
    super();

    this.id = id;
  }

  static async request(id: number): Promise<AlbumModel> {
    const response = <GetAnAlbumResponse> await SpotifyAPI.get(
      new GetAnAlbum(id),
    );

    return new AlbumModel(response);
  }

  async mockResponse(): Promise<AlbumModel> {
    return require('../mocks/spotify/albums').getAnAlbumMock();
  }

  getEndpoint() {
    return `albums/${this.id}`;
  }
}

export default GetAnAlbum;
