import BeatModel from '../models/audio-analysis/Beat';
import ForwardBranchModel from '../models/branches/ForwardBranch';
import BackwardBranchModel from '../models/branches/BackwardBranch';

export function createBranches(
  earliestBeat: BeatModel,
  latestBeat: BeatModel,
): [ForwardBranchModel, BackwardBranchModel] {
  const options = {
    earliestBeat,
    latestBeat,
  };

  return [
    new ForwardBranchModel(options),
    new BackwardBranchModel(options),
  ];
}
