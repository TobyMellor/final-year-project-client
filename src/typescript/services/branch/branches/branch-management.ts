import TrackModel from '../../../models/audio-analysis/Track';
import config from '../../../config';
import AudioAnalysisModel from '../../../models/audio-analysis/AudioAnalysis';
import * as branchFactory from '../../../factories/branch';
import BranchModel from '../../../models/branches/Branch';

export async function generateBranches(track: TrackModel): Promise<BranchModel[]> {
  const audioAnalysis = await track.getAudioAnalysis();

  if (config.mock.shouldMockBranchCreation) {
    return getMockForTrack(audioAnalysis);
  }

  // TODO: Implement some automatic logic here
  return [];
}

export function getMockForTrack({ trackID, beats }: AudioAnalysisModel): BranchModel[] {
  if (trackID === '4RVbK6cV0VqWdpCDcx3hiT') { // Reborn
    return [
      ...branchFactory.createBranches(beats[10], beats[50]),
      ...branchFactory.createBranches(beats[25], beats[150]),
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
