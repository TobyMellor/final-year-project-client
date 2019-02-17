import BeatModel from '../models/audio-analysis/Beat';
import ForwardBranchModel from '../models/branches/ForwardBranch';
import BackwardBranchModel from '../models/branches/BackwardBranch';
import { ForwardAndBackwardBranch } from '../types/general';

export function createForwardAndBackwardBranch(
  earliestBeat: BeatModel,
  latestBeat: BeatModel,
): ForwardAndBackwardBranch {
  const options = {
    earliestBeat,
    latestBeat,
  };

  return [
    new ForwardBranchModel(options),
    new BackwardBranchModel(options),
  ];
}
