import TrackModel from '../../../models/audio-analysis/Track';
import BranchModel from '../../../models/branches/Branch';
import ForwardBranchModel from '../../../models/branches/ForwardBranch';
import BackwardBranchModel from '../../../models/branches/BackwardBranch';
import config from '../../../config';
import AudioAnalysisModel from '../../../models/audio-analysis/AudioAnalysis';

export async function generateBranches(track: TrackModel): Promise<BranchModel[]> {
  const audioAnalysis = await track.getAudioAnalysis();

  if (config.mock.shouldMockBranchCreation) {
    return getMockForTrack(audioAnalysis);
  }

  // TODO: Implement some automatic logic here
  return [];
}

export function getMockForTrack(audioAnalysis: AudioAnalysisModel): BranchModel[] {
  const trackID = audioAnalysis.getTrackID();
  const beats = audioAnalysis.getBeats();

  if (trackID === '4RVbK6cV0VqWdpCDcx3hiT') { // Reborn
    return [
      new ForwardBranchModel({ originBeat: beats[10], destinationBeat: beats[50] }),
      new BackwardBranchModel({ originBeat: beats[150], destinationBeat: beats[10] }),
    ];
  }

  if (trackID === '3aUFrxO1B8EW63QchEl3wX') { // Feel The Love
    return [];
  }

  if (trackID === '2hmHlBM0kPBm17Y7nVIW9f') { // My Propeller
    return [];
  }

  if (trackID === '6wVWJl64yoTzU27EI8ep20') { // Crying Lightning
    return [];
  }

  if (trackID === '3O8NlPh2LByMU9lSRSHedm') { // Controlla
    return [];
  }

  // Default: Hotline Bling
  return [];
}
