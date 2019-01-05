import { GetAnAudioAnalysisResponseTimeInterval } from '../../types/spotify-responses';
import TimeIntervalModel from './TimeInterval';
import SegmentModel from './Segment';

interface Input extends GetAnAudioAnalysisResponseTimeInterval {
  order: number;
  segments: SegmentModel[];
}

class BeatModel extends TimeIntervalModel {
  private _segments: SegmentModel[];

  constructor(input: Input) {
    super(input);

    this._segments = input.segments;
  }

  public get segments(): SegmentModel[] {
    return this._segments;
  }

  public get timbre(): number {
    const segments = this._segments;
    const totalTimbre = segments.reduce((a, b) => a + b.timbre, 0);
    const averageTimbre = totalTimbre / segments.length;

    return averageTimbre;
  }

  public get maxLoudness(): number {
    const segments = this._segments;
    const totalMaxLoudness = segments.reduce((a, b) => a + b.maxLoudness, 0);
    const averageMaxLoudness = totalMaxLoudness / segments.length;

    return averageMaxLoudness;
  }
}

export default BeatModel;
