import BeatModel from '../audio-analysis/Beat';
import ActionModel, { Input as ActionInput } from '../Action';

export type BranchInput = {
  earliestBeat: BeatModel,
  latestBeat: BeatModel,
};

abstract class BranchModel extends ActionModel {
  public earliestBeat: BeatModel;
  public latestBeat: BeatModel;

  protected constructor({ originBeat, destinationBeat, earliestBeat, latestBeat }: ActionInput & BranchInput) {
    super({ originBeat, destinationBeat });

    const earliestBeatStartMs = earliestBeat.startMs;
    const latestBeatStartMs = latestBeat.startMs;

    if (earliestBeatStartMs === latestBeatStartMs) {
      throw new Error('Attempted to create a Branch leading to the same place!');
    }

    this.earliestBeat = earliestBeat;
    this.latestBeat = latestBeat;
  }

  public static isSameBranch(branch1: BranchModel, branch2: BranchModel) {
    return branch1.earliestBeat.order === branch2.earliestBeat.order
        && branch1.latestBeat.order === branch2.latestBeat.order;
  }
}

export default BranchModel;
