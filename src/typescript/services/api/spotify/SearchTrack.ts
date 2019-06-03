import SpotifyAPI from './SpotifyAPI';
import Request from '../Request';
import { objectToQueryParams } from '../../../utils/conversions';
import SearchTrackModel, { OutputTrack } from '../../../models/search-track';
import { SearchTrackResponseData, Track, SearchTrackResponse } from '../../../types/spotify-responses';
import * as localStorage from '../../../utils/localStorage';

class SearchTrack extends Request {
  private query: string;
  constructor(query: string) {
    super();
    this.query = query;
    this.baseURL = 'https://api.spotify.com/v1';
  }

  getEndpoint() {
    return `${this.baseURL}/search?${this.queryParams}`;
  }

  get headers() {
    return {
      Authorization: `Bearer ${localStorage.get('spotify_access_token')}`,
    };
  }

  static async request(query: string): Promise<OutputTrack[]> {
    const response = await SpotifyAPI.get(
      new SearchTrack(query),
    ) as SearchTrackResponse;
    if (response.status === 200) {
      const tracks: Track[] = response.data.tracks.items;
      return new SearchTrackModel(tracks).tracks;
    }
    return null;
  }

  async mockResponse(): Promise<OutputTrack[]> {
    const response: SearchTrackResponseData = require('../mocks/spotify/search-track').searchTracksMock();
    const tracks : Track[] = (response as SearchTrackResponseData).tracks.items;
    return new SearchTrackModel(tracks).tracks;
  }

  get queryParams() {
    const queryParamObject = {
      q: this.query,
      type: 'track',
      market: 'from_token',
      limit: '20',
    };
    return objectToQueryParams(queryParamObject);
  }

  public getParams() {
    const params = {
      headers: this.headers,
    };
    return params;
  }
}

export default SearchTrack;
