import Album from '../../../models/Album';
import SpotifyAPI from './SpotifyAPI';
import Request from '../Request';
import { GetAnAlbumResponse } from '../../../types/spotify-responses';

export class GetAnAlbum extends Request {
  private id: number;

  constructor(id: number) {
    super();

    this.id = id;
  }

  static async request(id: number): Promise<Album> {
    const response = <GetAnAlbumResponse> await SpotifyAPI.get(
      new GetAnAlbum(id),
    );

    return new Album(response);
  }

  async mockResponse(): Promise<Album> {
    return require('../mocks/spotify/albums').getAnAlbumMock();
  }

  getEndpoint() {
    return `albums/${this.id}`;
  }
}
