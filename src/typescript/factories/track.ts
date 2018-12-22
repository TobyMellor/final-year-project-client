import TrackModel from '../models/audio-analysis/Track';
import AudioAnalysisModel from '../models/audio-analysis/AudioAnalysis';
import GetATrack from '../services/api/spotify/tracks';
import GetAnAudioAnalysis from '../services/api/spotify/audio-analysis';
import GetAudioFeatures from '../services/api/spotify/audio-features';
import AudioFeaturesModel from '../models/audio-features/AudioFeatures';
import BranchModel from '../models/branches/Branch';

export async function createTrack(ID: string): Promise<TrackModel> {
  return GetATrack.request(ID);
}

export async function addAudioAnalysis(track: TrackModel): Promise<AudioAnalysisModel> {
  const audioAnalysis = await GetAnAudioAnalysis.request(track.getID());

  track.setAudioAnalysis(audioAnalysis);

  return audioAnalysis;
}

export async function addAudioFeatures(track: TrackModel): Promise<AudioFeaturesModel> {
  const audioFeatures = await GetAudioFeatures.request(track.getID());

  track.setAudioFeatures(audioFeatures);

  return audioFeatures;
}

// TODO: Implement
export async function addBranches(track: TrackModel): Promise<BranchModel[]> {
  return [];
}
