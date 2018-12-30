import BranchModel, { Input as BranchInput } from './Branch';

class BackwardBranchModel extends BranchModel {
  constructor(input: BranchInput) {
    const originBeatStartMs = input.originBeat.getStart().ms;
    const destinationBeatStartMs = input.destinationBeat.getStart().ms;

    if (originBeatStartMs === destinationBeatStartMs) {
      throw new Error('Attempted to create a Branch leading to the same place!');
    }

    if (originBeatStartMs < destinationBeatStartMs) {
      throw new Error('Attempted to create a Backwards Branch that\'s going forwards!');
    }

    super(input);
  }
}

export default BackwardBranchModel;
