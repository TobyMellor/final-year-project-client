import BranchModel, { Input as BranchInput } from './Branch';

class FowardBranchModel extends BranchModel {
  protected constructor(input: BranchInput) {
    super(input);
  }
}

export default FowardBranchModel;
