import BeatModel from '../audio-analysis/Beat';

export type Input = {
  ID: number,
  originBeat: BeatModel,
  destinationBeat: BeatModel,
};

abstract class BranchModel {
  private ID: number;
  private originBeat: BeatModel;
  private destinationBeat: BeatModel;

  protected constructor({ ID, originBeat, destinationBeat }: Input) {
    this.ID = ID,
    this.originBeat = originBeat;
    this.destinationBeat = destinationBeat;
  }

  public getID(): number {
    return this.ID;
  }

  public getOriginBeat(): BeatModel {
    return this.originBeat;
  }

  public getDestinationBeat(): BeatModel {
    return this.destinationBeat;
  }
}

export default BranchModel;
