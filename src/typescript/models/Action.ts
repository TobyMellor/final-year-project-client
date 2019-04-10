import BeatModel from './audio-analysis/Beat';

export type Input = {
  originBeat: BeatModel,
  destinationBeat: BeatModel,
};

abstract class ActionModel {
  public originBeat: BeatModel;
  public destinationBeat: BeatModel;

  private _usedCount: number = 0;

  protected constructor({ originBeat, destinationBeat }: Input) {
    this.originBeat = originBeat;
    this.destinationBeat = destinationBeat;
  }

  public get usedCount(): number {
    return this._usedCount;
  }

  public used() {
    this._usedCount += 1;
  }
}

export default ActionModel;
