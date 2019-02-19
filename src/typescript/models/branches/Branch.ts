import BeatModel from '../audio-analysis/Beat';

export type Input = {
  earliestBeat: BeatModel,
  latestBeat: BeatModel,
};

abstract class BranchModel {
  private _earliestBeat: BeatModel;
  private _latestBeat: BeatModel;

  protected abstract _originBeat: BeatModel;
  protected abstract _destinationBeat: BeatModel;

  private _usedCount: number = 0;

  protected constructor({ earliestBeat, latestBeat }: Input) {
    const earliestBeatStartMs = earliestBeat.startMs;
    const latestBeatStartMs = latestBeat.startMs;

    if (earliestBeatStartMs === latestBeatStartMs) {
      throw new Error('Attempted to create a Branch leading to the same place!');
    }

    this._earliestBeat = earliestBeat;
    this._latestBeat = latestBeat;
  }

  public get earliestBeat(): BeatModel {
    return this._earliestBeat;
  }

  public get latestBeat(): BeatModel {
    return this._latestBeat;
  }

  public get originBeat(): BeatModel {
    return this._originBeat;
  }

  public get destinationBeat(): BeatModel {
    return this._destinationBeat;
  }

  public get usedCount(): number {
    return this._usedCount;
  }

  public used() {
    this._usedCount += 1;
  }

  public static isSameBranch(branch1: BranchModel, branch2: BranchModel) {
    return branch1.earliestBeat.order === branch2.earliestBeat.order
        && branch1.latestBeat.order === branch2.latestBeat.order;
  }
}

export default BranchModel;
