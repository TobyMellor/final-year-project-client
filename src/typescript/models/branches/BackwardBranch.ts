import Branch, { Input as BranchInput } from './Branch';

class BackwardBranch extends Branch {
  protected constructor(input: BranchInput) {
    super(input);
  }
}

export default BackwardBranch;
