import Request from '../Request';
import { GetATrackSuccessResponse, GetATrackResponseData } from '../../../types/spotify-responses';
import TrackModel from '../../../models/audio-analysis/Track';
import GetAnAudioAnalysis from './audio-analysis';
import GetAudioFeatures from './audio-features';
import API from '../API';
import SpotifyRequest from './SpotifyRequest';

class GetATrack extends SpotifyRequest {
  private ID: string;

  constructor(ID: string) {
    super();
    this.ID = ID;
  }

  static async request(ID: string): Promise<TrackModel> {
    const [getATrackResponse, audioAnalysis, audioFeatures] = await Promise.all([
      API.get(new GetATrack(ID)),
      GetAnAudioAnalysis.request(ID),
      GetAudioFeatures.request(ID),
    ]);

    const getATrackResponseTyped = (getATrackResponse as GetATrackSuccessResponse).data;
    return new TrackModel({
      ...getATrackResponseTyped,
      audioAnalysis,
      audioFeatures,
    });
  }

  async mockResponse(): Promise<GetATrackSuccessResponse> {
    const responseData: GetATrackResponseData =
    await require('../mocks/spotify/tracks').getATrackMock(this.ID);
    return {
      ...this.mockSampleResponse,
      data: responseData,
    };
  }

  getEndpoint() {
    return `${this.baseURL}/tracks/${this.ID}`;
  }
}

export default GetATrack;
