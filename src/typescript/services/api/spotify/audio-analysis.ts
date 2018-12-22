import SpotifyAPI from './SpotifyAPI';
import Request from '../Request';
import { GetAnAudioAnalysisResponse } from '../../../types/spotify-responses';
import AudioAnalysisModel from '../../../models/audio-analysis/AudioAnalysis';

class GetAnAudioAnalysis extends Request {
  private ID: string;

  constructor(ID: string) {
    super();

    this.ID = ID;
  }

  static async request(ID: string): Promise<AudioAnalysisModel> {
    const response = <GetAnAudioAnalysisResponse> await SpotifyAPI.get(
      new GetAnAudioAnalysis(ID),
    );

    return new AudioAnalysisModel(response);
  }

  async mockResponse(): Promise<AudioAnalysisModel> {
    return require('../mocks/spotify/audio-analysis').getAnAudioAnalysisMock(this.ID);
  }

  getEndpoint() {
    return `audio-analysis/${this.ID}`;
  }
}

export default GetAnAudioAnalysis;
