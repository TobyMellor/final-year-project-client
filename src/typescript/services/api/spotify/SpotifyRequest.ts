import Request from '../Request';
import * as localStorage from '../../../utils/localStorage';

abstract class SpotifyRequest extends Request {
  protected baseURL = 'https://api.spotify.com/v1/';
  public abstract mockResponse(): Promise<Object>;
  public abstract getEndpoint(): string;

  get headers() {
    return {
      Authorization: `Bearer ${localStorage.get('spotify_access_token')}`,
    };
  }

  getParams() {
    const params = {
      headers: this.headers,
    };
    return params;
  }

  queryParams() {
    return '';
  }
}

export default SpotifyRequest;
