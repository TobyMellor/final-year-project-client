import BeatModel from './audio-analysis/Beat';
import TrackModel from './audio-analysis/Track';

export type Input = {
  track: TrackModel,
  originBeat: BeatModel,
  destinationBeat: BeatModel,
};

abstract class ActionModel {
  public track: TrackModel;
  public originBeat: BeatModel;
  public destinationBeat: BeatModel;

  private _usedCount: number = 0;

  protected constructor({ track, originBeat, destinationBeat }: Input) {
    this.track = track;
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
