import TrackModel from '../../../models/audio-analysis/Track';
import config from '../../../config';
import AudioAnalysisModel from '../../../models/audio-analysis/AudioAnalysis';
import * as branchFactory from '../../../factories/branch';
import { ForwardAndBackwardBranches, ForwardAndBackwardBranch } from '../../../types/general';

export async function generateBranches(track: TrackModel): Promise<ForwardAndBackwardBranches> {
  const audioAnalysis = await track.getAudioAnalysis();

  if (config.mock.shouldMockBranchCreation) {
    return getMockForTrack(audioAnalysis);
  }

  // TODO: Implement some automatic logic here
  return [[], []];
}

export function getMockForTrack(
  { trackID, beats }: AudioAnalysisModel,
): ForwardAndBackwardBranches {
  const branches: ForwardAndBackwardBranches = [[], []];

  if (trackID === '4RVbK6cV0VqWdpCDcx3hiT') { // Reborn
    pushBranch(branches, branchFactory.createForwardAndBackwardBranch(beats[0], beats[50]));
    pushBranch(branches, branchFactory.createForwardAndBackwardBranch(beats[25], beats[150]));
    pushBranch(branches, branchFactory.createForwardAndBackwardBranch(beats[130], beats[250]));
  } else if (trackID === '3aUFrxO1B8EW63QchEl3wX') { // Feel The Love
    // TODO: Implement Mock
  } else if (trackID === '2hmHlBM0kPBm17Y7nVIW9f') { // My Propeller
    // TODO: Implement Mock
  } else if (trackID === '6wVWJl64yoTzU27EI8ep20') { // Crying Lightning
    // TODO: Implement Mock
  } else if (trackID === '3O8NlPh2LByMU9lSRSHedm') { // Controlla
    // TODO: Implement Mock
  } else {
    // TODO: Implement Mock
  }

  return branches;
}

function pushBranch(
  [forwardBranches, backwardBranches]: ForwardAndBackwardBranches,
  [forwardBranch, backwardBranch]: ForwardAndBackwardBranch,
) {
  forwardBranches.push(forwardBranch);
  backwardBranches.push(backwardBranch);
}
