import { GetAnAudioAnalysisResponseTimeInterval } from '../../types/spotify-responses';
import TimeIntervalModel from './TimeInterval';
import BeatModel from './Beat';

interface Input extends GetAnAudioAnalysisResponseTimeInterval {
  order: number;
  beats: BeatModel[];
}

class BarModel extends TimeIntervalModel {
  private _beats: BeatModel[];

  constructor(input: Input) {
    super(input);

    this._beats = input.beats;
  }

  public get beats(): BeatModel[] {
    return this._beats;
  }
}

export default BarModel;
