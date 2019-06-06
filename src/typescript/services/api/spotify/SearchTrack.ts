import Request from '../Request';
import { objectToQueryParams } from '../../../utils/conversions';
import SearchTrackModel, { OutputTrack } from '../../../models/search-track';
import { SearchTrackResponseData, Track, SearchTrackSuccessResponse } from '../../../types/spotify-responses';
import API from '../API';
import SpotifyRequest from './SpotifyRequest';

class SearchTrack extends SpotifyRequest {
  private query: string;
  constructor(query: string) {
    super();
    this.query = query;
  }

  static async request(query: string): Promise<OutputTrack[]> {
    const response = await API.get(
      new SearchTrack(query),
    ) as SearchTrackSuccessResponse;
    if (response && response.status === 200) {
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

  getEndpoint() {
    return `${this.baseURL}/search?${this.queryParams}`;
  }

}

export default SearchTrack;
