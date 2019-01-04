import BranchModel, { Input as BranchInput } from './Branch';
import BeatModel from '../audio-analysis/Beat';

class ForwardBranchModel extends BranchModel {
  protected _originBeat: BeatModel;
  protected _destinationBeat: BeatModel;

  constructor(input: BranchInput) {
    super(input);

    this._originBeat = input.earliestBeat;
    this._destinationBeat = input.latestBeat;
  }
}

export default ForwardBranchModel;
