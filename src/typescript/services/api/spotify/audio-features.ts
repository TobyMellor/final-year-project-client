import Request from '../Request';
import { GetAudioFeaturesSuccessResponse } from '../../../types/spotify-responses';
import AudioFeaturesModel from '../../../models/audio-features/AudioFeatures';
import SpotifyRequest from './SpotifyRequest';
import API from '../API';

class GetAudioFeatures extends SpotifyRequest {
  private ID: string;

  constructor(ID: string) {
    super();
    this.ID = ID;
  }

  static async request(ID: string): Promise<AudioFeaturesModel> {
    const response = <GetAudioFeaturesSuccessResponse> await API.get(
      new GetAudioFeatures(ID),
    );

    return new AudioFeaturesModel(response.data);
  }

  async mockResponse(): Promise<AudioFeaturesModel> {
    return require('../mocks/spotify/audio-features').getAudioFeaturesMock(this.ID);
  }

  getEndpoint() {
    return `${this.baseURL}/audio-features/${this.ID}`;
  }
}

export default GetAudioFeatures;
