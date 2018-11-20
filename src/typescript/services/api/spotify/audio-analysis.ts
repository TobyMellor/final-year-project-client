import SpotifyAPI from './SpotifyAPI';
import Request from '../Request';
import { GetAnAudioAnalysisResponse } from '../../../types/spotify-responses';
import Track from '../../../models/audio-analysis/Track';
import AudioAnalysis from '../../../models/audio-analysis/AudioAnalysis';

export class GetAnAudioAnalysis extends Request {
  private ID: string;

  constructor(ID: string) {
    super();

    this.ID = ID;
  }

  static async request(ID: string): Promise<AudioAnalysis> {
    const response = <GetAnAudioAnalysisResponse> await SpotifyAPI.get(
      new GetAnAudioAnalysis(ID),
    );

    return new AudioAnalysis(response);
  }

  async mockResponse(): Promise<Track> {
    return require('../mocks/spotify/audio-analysis').getAnAudioAnalysis(this.ID);
  }

  getEndpoint() {
    return `audio-analysis/${this.ID}`;
  }
}
