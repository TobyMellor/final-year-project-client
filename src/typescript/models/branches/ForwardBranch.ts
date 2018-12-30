import BranchModel, { Input as BranchInput } from './Branch';

class FowardBranchModel extends BranchModel {
  constructor(input: BranchInput) {
    const originBeatStartMs = input.originBeat.getStart().ms;
    const destinationBeatStartMs = input.destinationBeat.getStart().ms;

    if (originBeatStartMs === destinationBeatStartMs) {
      throw new Error('Attempted to create a Branch leading to the same place!');
    }

    if (originBeatStartMs > destinationBeatStartMs) {
      throw new Error('Attempted to create a Forward Branch that\'s going backwards!');
    }

    super(input);
  }
}

export default FowardBranchModel;
