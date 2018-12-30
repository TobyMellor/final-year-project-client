import BeatModel from '../audio-analysis/Beat';

export type Input = {
  originBeat: BeatModel,
  destinationBeat: BeatModel,
};

abstract class BranchModel {
  private originBeat: BeatModel;
  private destinationBeat: BeatModel;

  protected constructor({ originBeat, destinationBeat }: Input) {
    this.originBeat = originBeat;
    this.destinationBeat = destinationBeat;
  }

  public getOriginBeat(): BeatModel {
    return this.originBeat;
  }

  public getDestinationBeat(): BeatModel {
    return this.destinationBeat;
  }
}

export default BranchModel;
