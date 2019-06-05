import Request from '../Request';
import { GetAudioFeaturesResponse } from '../../../types/spotify-responses';
import AudioFeaturesModel from '../../../models/audio-features/AudioFeatures';
import * as localStorage from '../../../utils/localStorage';
import API from '../API';

class GetAudioFeatures extends Request {
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

  static async request(ID: string): Promise<AudioFeaturesModel> {
    const response = <GetAudioFeaturesResponse> await API.get(
      new GetAudioFeatures(ID),
    );

    return new AudioFeaturesModel(response);
  }

  async mockResponse(): Promise<AudioFeaturesModel> {
    return require('../mocks/spotify/audio-features').getAudioFeaturesMock(this.ID);
  }

  public getParams() {
    const params = {
      headers: this.headers,
    };
    return params;
  }

  getEndpoint() {
    return `${this.baseURL}/audio-features/${this.ID}`;
  }
}

export default GetAudioFeatures;
