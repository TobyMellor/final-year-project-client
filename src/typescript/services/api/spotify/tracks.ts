import SpotifyAPI from './SpotifyAPI';
import Request from '../Request';
import { GetATrackResponse } from '../../../types/spotify-responses';
import TrackModel from '../../../models/audio-analysis/Track';

class GetATrack extends Request {
  private ID: string;

  constructor(ID: string) {
    super();

    this.ID = ID;
  }

  static async request(ID: string): Promise<TrackModel> {
    const response = <GetATrackResponse> await SpotifyAPI.get(
      new GetATrack(ID),
    );

    return new TrackModel(response);
  }

  async mockResponse(): Promise<TrackModel> {
    return require('../mocks/spotify/tracks').getATrackMock(this.ID);
  }

  getEndpoint() {
    return `tracks/${this.ID}`;
  }
}

export default GetATrack;
