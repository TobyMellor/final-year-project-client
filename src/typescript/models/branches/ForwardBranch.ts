import BranchModel, { Input as BranchInput } from './Branch';
import BeatModel from '../audio-analysis/Beat';

class ForwardBranchModel extends BranchModel {
  protected originBeat: BeatModel;
  protected destinationBeat: BeatModel;

  constructor(input: BranchInput) {
    super(input);

    this.originBeat = input.earliestBeat;
    this.destinationBeat = input.latestBeat;
  }
}

export default ForwardBranchModel;
