import { GetAnAudioAnalysisResponseTimeInterval } from '../../types/spotify-responses';
import TimeIntervalModel from './TimeInterval';
import SegmentModel from './Segment';
import BarModel from './Bar';

interface Input extends GetAnAudioAnalysisResponseTimeInterval {
  order: number;
  segments: SegmentModel[];
}

class BeatModel extends TimeIntervalModel {
  private _segments: SegmentModel[];
  private _barOrder: number;

  constructor(input: Input) {
    super(input);

    this._segments = input.segments;
  }

  public get segments(): SegmentModel[] {
    return this._segments;
  }

  public get timbre(): number {
    const segments = this._segments;
    const totalTimbre = segments.reduce((a, b) => a + b.averageTimbre, 0);
    const averageTimbre = totalTimbre / segments.length;

    return averageTimbre;
  }

  public get maxLoudness(): number {
    const segments = this._segments;
    const totalMaxLoudness = segments.reduce((a, b) => a + b.maxLoudness, 0);
    const averageMaxLoudness = totalMaxLoudness / segments.length;

    return averageMaxLoudness;
  }

  public set barOrder(barOrder: number) {
    this._barOrder = barOrder;
  }

  public get barOrder() {
    return this._barOrder;
  }
}

export default BeatModel;
