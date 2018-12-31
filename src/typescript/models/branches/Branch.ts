import BeatModel from '../audio-analysis/Beat';

export type Input = {
  earliestBeat: BeatModel,
  latestBeat: BeatModel,
};

abstract class BranchModel {
  private earliestBeat: BeatModel;
  private latestBeat: BeatModel;

  protected abstract originBeat: BeatModel;
  protected abstract destinationBeat: BeatModel;

  private usedCount: number = 0;

  protected constructor({ earliestBeat, latestBeat }: Input) {
    const earliestBeatStartMs = earliestBeat.getStartMs();
    const latestBeatStartMs = latestBeat.getStartMs();

    if (earliestBeatStartMs === latestBeatStartMs) {
      throw new Error('Attempted to create a Branch leading to the same place!');
    }

    this.earliestBeat = earliestBeat;
    this.latestBeat = latestBeat;
  }

  public getEarliestBeat(): BeatModel {
    return this.earliestBeat;
  }

  public getLatestBeat(): BeatModel {
    return this.latestBeat;
  }

  public getOriginBeat(): BeatModel {
    return this.originBeat;
  }

  public getDestinationBeat(): BeatModel {
    return this.destinationBeat;
  }

  public getUsedCount(): number {
    return this.usedCount;
  }

  public used() {
    this.usedCount += 1;
  }
}

export default BranchModel;
