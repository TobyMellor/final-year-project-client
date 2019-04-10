import BranchModel, { BranchInput } from './Branch';

class ForwardBranchModel extends BranchModel {
  constructor({ earliestBeat, latestBeat }: BranchInput) {
    super({
      earliestBeat,
      latestBeat,
      originBeat: earliestBeat,
      destinationBeat: latestBeat,
    });
  }
}

export default ForwardBranchModel;
