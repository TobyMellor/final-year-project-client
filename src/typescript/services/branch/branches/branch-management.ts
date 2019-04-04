import TrackModel from '../../../models/audio-analysis/Track';
import config from '../../../config';
import AudioAnalysisModel from '../../../models/audio-analysis/AudioAnalysis';
import * as branchFactory from '../../../factories/branch';
import * as branchAnalysis from './branch-analysis';
import { ForwardAndBackwardBranches, ForwardAndBackwardBranch } from '../../../types/general';
import { getTimeIdentifierFromMilliseconds } from '../../../utils/conversions';

export async function generateBranches(track: TrackModel): Promise<ForwardAndBackwardBranches> {
  const audioAnalysis = await track.getAudioAnalysis();

  if (config.mock.shouldMockBranchCreation) {
    return getMockForTrack(audioAnalysis);
  }

  const similarBeats = branchAnalysis.getSimilarBeats(audioAnalysis.beats);

  return similarBeats.reduce((acc, [firstBeat, secondBeat]) => {
    pushBranch(acc, branchFactory.createForwardAndBackwardBranch(firstBeat, secondBeat));
    return acc;
  }, [[], []] as ForwardAndBackwardBranches);
}

export function getMockForTrack(
  { trackID, beats }: AudioAnalysisModel,
): ForwardAndBackwardBranches {
  const branches: ForwardAndBackwardBranches = [[], []];

  if (trackID === '4RVbK6cV0VqWdpCDcx3hiT') { // Reborn
    pushBranch(branches, branchFactory.createForwardAndBackwardBranch(beats[53], beats[102]));
    pushBranch(branches, branchFactory.createForwardAndBackwardBranch(beats[53], beats[325]));
  } else if (trackID === '3aUFrxO1B8EW63QchEl3wX') { // Feel The Love
    // TODO: Implement Mock
  } else if (trackID === '2hmHlBM0kPBm17Y7nVIW9f') { // My Propeller
    // TODO: Implement
  } else if (trackID === '6wVWJl64yoTzU27EI8ep20') { // Crying Lightning
    pushBranch(branches, branchFactory.createForwardAndBackwardBranch(beats[43], beats[230]));
    pushBranch(branches, branchFactory.createForwardAndBackwardBranch(beats[253], beats[354]));
    pushBranch(branches, branchFactory.createForwardAndBackwardBranch(beats[100], beats[120]));
    pushBranch(branches, branchFactory.createForwardAndBackwardBranch(beats[120], beats[164]));
    pushBranch(branches, branchFactory.createForwardAndBackwardBranch(beats[10], beats[205]));
    pushBranch(branches, branchFactory.createForwardAndBackwardBranch(beats[10], beats[205]));
    pushBranch(branches, branchFactory.createForwardAndBackwardBranch(beats[25], beats[75]));
  } else if (trackID === '3O8NlPh2LByMU9lSRSHedm') { // Controlla
    pushBranch(branches, branchFactory.createForwardAndBackwardBranch(beats[65], beats[100]));
    pushBranch(branches, branchFactory.createForwardAndBackwardBranch(beats[4], beats[200]));
    pushBranch(branches, branchFactory.createForwardAndBackwardBranch(beats[150], beats[183]));
  } else {
    // TODO: Implement Mock
  }

  console.log("MOCH FOR TRACK:", branches);

  return branches;
}

function pushBranch(
  [forwardBranches, backwardBranches]: ForwardAndBackwardBranches,
  [forwardBranch, backwardBranch]: ForwardAndBackwardBranch,
) {
  forwardBranches.push(forwardBranch);
  backwardBranches.push(backwardBranch);
}
