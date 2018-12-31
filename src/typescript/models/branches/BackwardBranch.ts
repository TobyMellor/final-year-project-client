import BranchModel, { Input as BranchInput } from './Branch';
import BeatModel from '../audio-analysis/Beat';

class BackwardBranchModel extends BranchModel {
  protected originBeat: BeatModel;
  protected destinationBeat: BeatModel;

  constructor(input: BranchInput) {
    super(input);

    this.originBeat = input.latestBeat;
    this.destinationBeat = input.earliestBeat;
  }
}

export default BackwardBranchModel;
