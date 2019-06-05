import Request from '../Request';
import { GetATrackResponse } from '../../../types/spotify-responses';
import TrackModel from '../../../models/audio-analysis/Track';
import GetAnAudioAnalysis from './audio-analysis';
import GetAudioFeatures from './audio-features';
import * as localStorage from '../../../utils/localStorage';
import API from '../API';

class GetATrack extends Request {
  private ID: string;

  constructor(ID: string) {
    super();

    this.ID = ID;
    this.baseURL = 'https://api.spotify.com/v1';
  }

  get headers() {
    return {
      Authorization: `Bearer ${localStorage.get('spotify_access_token')}`,
    };
  }

  static async request(ID: string): Promise<TrackModel> {
    const [getATrackResponse, audioAnalysis, audioFeatures] = await Promise.all([
      API.get(new GetATrack(ID)),
      GetAnAudioAnalysis.request(ID),
      GetAudioFeatures.request(ID),
    ]);

    const getATrackResponseTyped = getATrackResponse as GetATrackResponse;
    return new TrackModel({
      ...getATrackResponseTyped,
      audioAnalysis,
      audioFeatures,
    });
  }

  async mockResponse(): Promise<TrackModel> {
    return require('../mocks/spotify/tracks').getATrackMock(this.ID);
  }

  getEndpoint() {
    return `${this.baseURL}/tracks/${this.ID}`;
  }

  public getParams() {
    const params = {
      headers: this.headers,
    };
    return params;
  }
}

export default GetATrack;
