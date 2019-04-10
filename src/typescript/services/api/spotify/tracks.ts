import SpotifyAPI from './SpotifyAPI';
import Request from '../Request';
import { GetATrackResponse } from '../../../types/spotify-responses';
import TrackModel from '../../../models/audio-analysis/Track';
import GetAnAudioAnalysis from './audio-analysis';
import GetAudioFeatures from './audio-features';

class GetATrack extends Request {
  private ID: string;

  constructor(ID: string) {
    super();

    this.ID = ID;
  }

  static async request(ID: string): Promise<TrackModel> {
    const [getATrackResponse, audioAnalysis, audioFeatures] = await Promise.all([
      SpotifyAPI.get(new GetATrack(ID)),
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
    return `tracks/${this.ID}`;
  }
}

export default GetATrack;
