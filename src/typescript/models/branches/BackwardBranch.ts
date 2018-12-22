import BranchModel, { Input as BranchInput } from './Branch';

class BackwardBranchModel extends BranchModel {
  protected constructor(input: BranchInput) {
    super(input);
  }
}

export default BackwardBranchModel;
