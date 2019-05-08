import BeatModel from '../audio-analysis/Beat';
import ActionModel, { Input as ActionInput } from '../Action';
import TrackModel from '../audio-analysis/Track';

export type BranchInput = {
  track: TrackModel,
  earliestBeat: BeatModel,
  latestBeat: BeatModel,
};

abstract class BranchModel extends ActionModel {
  public earliestBeat: BeatModel;
  public latestBeat: BeatModel;

  protected constructor({ track, originBeat, destinationBeat, earliestBeat, latestBeat }: ActionInput & BranchInput) {
    super({ track, originBeat, destinationBeat });

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

  public get size() {
    return this.latestBeat.order - this.earliestBeat.order;
  }
}

export default BranchModel;
