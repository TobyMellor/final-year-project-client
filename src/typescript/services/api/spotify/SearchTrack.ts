import { objectToQueryParams } from '../../../utils/conversions';
import SearchTrackModel, { RemoteTrack } from '../../../models/search-track';
import { SearchTrackResponseData, SearchTrackSuccessResponse } from '../../../types/spotify-responses';
import API from '../API';
import SpotifyRequest from './SpotifyRequest';

class SearchTrack extends SpotifyRequest {
  private query: string;
  constructor(query: string) {
    super();
    this.query = query;
  }

  static async request(query: string): Promise<RemoteTrack[]> {
    const response = await API.get(
      new SearchTrack(query),
    ) as SearchTrackSuccessResponse;
    if (response && response.status === 200) {
      const tracks = response.data.tracks.items;
      return new SearchTrackModel(tracks).tracks;
    }
    return null;
  }

  async mockResponse(): Promise<SearchTrackSuccessResponse> {
    const responseData: SearchTrackResponseData = await require('../mocks/spotify/search-track').searchTracksMock();
    return {
      ...this.mockSampleResponse,
      data: responseData,
    };
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
