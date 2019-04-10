import BranchModel, { BranchInput } from './Branch';

class ForwardBranchModel extends BranchModel {
  constructor({ track, earliestBeat, latestBeat }: BranchInput) {
    super({
      track,
      earliestBeat,
      latestBeat,
      originBeat: earliestBeat,
      destinationBeat: latestBeat,
    });
  }
}

export default ForwardBranchModel;
