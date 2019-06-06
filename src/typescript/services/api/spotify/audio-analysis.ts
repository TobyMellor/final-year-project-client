import Request from '../Request';
import { GetAnAudioAnalysisResponse } from '../../../types/spotify-responses';
import AudioAnalysisModel from '../../../models/audio-analysis/AudioAnalysis';
import API from '../API';
import SpotifyRequest from './SpotifyRequest';

class GetAnAudioAnalysis extends SpotifyRequest {
  private ID: string;

  constructor(ID: string) {
    super();
    this.ID = ID;
  }

  static async request(ID: string): Promise<AudioAnalysisModel> {
    const response: any = <GetAnAudioAnalysisResponse> await API.get(
      new GetAnAudioAnalysis(ID),
    );
    return new AudioAnalysisModel({ trackID: ID, ...response.data });
  }

  async mockResponse(): Promise<AudioAnalysisModel> {
    return require('../mocks/spotify/audio-analysis').getAnAudioAnalysisMock(this.ID);
  }

  getEndpoint() {
    return `${this.baseURL}/audio-analysis/${this.ID}`;
  }
}

export default GetAnAudioAnalysis;
