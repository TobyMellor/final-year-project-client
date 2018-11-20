import Beat from '../audio-analysis/Beat';

export type Input = {
  ID: number,
  originBeat: Beat,
  destinationBeat: Beat,
};

abstract class Branch {
  private ID: number;
  private originBeat: Beat;
  private destinationBeat: Beat;

  protected constructor({ ID, originBeat, destinationBeat }: Input) {
    this.ID = ID,
    this.originBeat = originBeat;
    this.destinationBeat = destinationBeat;
  }
}

export default Branch;
