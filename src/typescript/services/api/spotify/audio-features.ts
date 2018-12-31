import SpotifyAPI from './SpotifyAPI';
import Request from '../Request';
import { GetAudioFeaturesResponse } from '../../../types/spotify-responses';
import AudioFeaturesModel from '../../../models/audio-features/AudioFeatures';

class GetAudioFeatures extends Request {
  private ID: string;

  constructor(ID: string) {
    super();

    this.ID = ID;
  }

  static async request(ID: string): Promise<AudioFeaturesModel> {
    const response = <GetAudioFeaturesResponse> await SpotifyAPI.get(
      new GetAudioFeatures(ID),
    );

    return new AudioFeaturesModel(response);
  }

  async mockResponse(): Promise<AudioFeaturesModel> {
    return require('../mocks/spotify/audio-features').getAudioFeaturesMock(this.ID);
  }

  getEndpoint() {
    return `audio-features/${this.ID}`;
  }
}

export default GetAudioFeatures;
