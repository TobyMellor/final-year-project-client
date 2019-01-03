import { GetAnAudioAnalysisResponseTimeInterval } from '../../types/spotify-responses';
import TimeIntervalModel from './TimeInterval';
import BeatModel from './Beat';

interface Input extends GetAnAudioAnalysisResponseTimeInterval {
  order: number;
  beats: BeatModel[];
}

class BarModel extends TimeIntervalModel {
  private beats: BeatModel[];

  constructor(input: Input) {
    super(input);

    this.beats = input.beats;
  }

  public getBeats(): BeatModel[] {
    return this.beats;
  }
}

export default BarModel;
