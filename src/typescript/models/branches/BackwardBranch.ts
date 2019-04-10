import BranchModel, { BranchInput } from './Branch';

class BackwardBranchModel extends BranchModel {
  constructor({ track, earliestBeat, latestBeat }: BranchInput) {
    super({
      track,
      earliestBeat,
      latestBeat,
      originBeat: latestBeat,
      destinationBeat: earliestBeat,
    });

  }
}

export default BackwardBranchModel;
