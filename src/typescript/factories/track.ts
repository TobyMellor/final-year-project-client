import Track from '../models/audio-analysis/Track';
import { GetATrack } from '../services/api/spotify/tracks';
import { GetAnAudioAnalysis } from '../services/api/spotify/audio-analysis';

export async function createTrack(ID: string): Promise<Track> {
  return GetATrack.request(ID);
}

export async function addAudioAnalysis(track: Track): Promise<Track> {
  if (!track.getAudioAnalysis()) {
    const audioAnalysis = await GetAnAudioAnalysis.request(track.getID());

    track.setAudioAnalysis(audioAnalysis);
  }

  return track;
}

// TODO: Implement
export async function addAudioFeatures(track: Track) {
  return track;
}
