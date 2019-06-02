import Request from '../Request';
// import { objectToQueryParams } from '../../../utils/conversions';
import SpotifyAPI from './SpotifyAPI';
import SearchTrackModel, { OutputTrack } from '../../../models/search-track';
import { SearchTrackResponse, Track } from '../../../types/spotify-responses';

class SearchTrack extends Request {

  getEndpoint() {
    return 'v1/search/';
  }

  static async request(id: string): Promise<OutputTrack[]> {
    const response = await SpotifyAPI.get(
      new SearchTrack(),
    );
    const tracks: Track[] = (response as SearchTrackResponse).tracks.items;
    return new SearchTrackModel(tracks).tracks;
  }

  async mockResponse(): Promise<OutputTrack[]> {
    const response: SearchTrackResponse = require('../mocks/spotify/search-track').searchTracksMock();
    const tracks : Track[] = (response as SearchTrackResponse).tracks.items;
    return new SearchTrackModel(tracks).tracks;
  }

  public getParams() {
    const params = {
      type: 'track',
      market: 'from_token',
      limit: '20',
    };
    return params;
    // return objectToQueryParams(params);
  }
}

export default SearchTrack;
