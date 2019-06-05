import SpotifyAPI from './SpotifyAPI';
import Request from '../Request';
import { GetAnAudioAnalysisResponse } from '../../../types/spotify-responses';
import AudioAnalysisModel from '../../../models/audio-analysis/AudioAnalysis';
import * as localStorage from '../../../utils/localStorage';

class GetAnAudioAnalysis extends Request {
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

  static async request(ID: string): Promise<AudioAnalysisModel> {
    const response = <GetAnAudioAnalysisResponse> await SpotifyAPI.get(
      new GetAnAudioAnalysis(ID),
    );

    return new AudioAnalysisModel({ trackID: ID, ...response });
  }

  async mockResponse(): Promise<AudioAnalysisModel> {
    return require('../mocks/spotify/audio-analysis').getAnAudioAnalysisMock(this.ID);
  }

  public getParams() {
    const params = {
      headers: this.headers,
    };
    return params;
  }

  getEndpoint() {
    return `${this.baseURL}/audio-analysis/${this.ID}`;
  }
}

export default GetAnAudioAnalysis;
