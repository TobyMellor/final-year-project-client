import Request from '../Request';
import { GetAnAudioAnalysisSuccessResponse, GetAnAudioAnalysisData } from '../../../types/spotify-responses';
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
    const response = <GetAnAudioAnalysisSuccessResponse> await API.get(
      new GetAnAudioAnalysis(ID),
    );
    return new AudioAnalysisModel({ trackID: ID, ...response.data });
  }

  async mockResponse(): Promise<GetAnAudioAnalysisSuccessResponse> {
    const responseData: GetAnAudioAnalysisData =
      await require('../mocks/spotify/audio-analysis').getAnAudioAnalysisMock(this.ID);
    return {
      ...this.mockSampleResponse,
      data: responseData,
    };
  }

  getEndpoint() {
    return `${this.baseURL}/audio-analysis/${this.ID}`;
  }
}

export default GetAnAudioAnalysis;
