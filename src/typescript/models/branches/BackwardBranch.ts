import BranchModel, { Input as BranchInput } from './Branch';
import BeatModel from '../audio-analysis/Beat';

class BackwardBranchModel extends BranchModel {
  protected _originBeat: BeatModel;
  protected _destinationBeat: BeatModel;

  constructor(input: BranchInput) {
    super(input);

    this._originBeat = input.latestBeat;
    this._destinationBeat = input.earliestBeat;
  }
}

export default BackwardBranchModel;
