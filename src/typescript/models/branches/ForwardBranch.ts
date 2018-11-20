import Branch, { Input as BranchInput } from './Branch';

class FowardBranch extends Branch {
  protected constructor(input: BranchInput) {
    super(input);
  }
}

export default FowardBranch;
