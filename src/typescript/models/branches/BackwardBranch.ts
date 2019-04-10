import BranchModel, { BranchInput } from './Branch';

class BackwardBranchModel extends BranchModel {
  constructor({ earliestBeat, latestBeat }: BranchInput) {
    super({
      earliestBeat,
      latestBeat,
      originBeat: latestBeat,
      destinationBeat: earliestBeat,
    });

  }
}

export default BackwardBranchModel;
