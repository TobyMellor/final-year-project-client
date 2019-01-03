import { GetAnAudioAnalysisResponseTimeInterval } from '../../types/spotify-responses';
import TimeIntervalModel from './TimeInterval';
import SegmentModel from './Segment';

interface Input extends GetAnAudioAnalysisResponseTimeInterval {
  order: number;
  segments: SegmentModel[];
}

class BeatModel extends TimeIntervalModel {
  private segments: SegmentModel[];

  constructor(input: Input) {
    super(input);

    this.segments = input.segments;
  }

  public getSegments(): SegmentModel[] {
    return this.segments;
  }

  public getTimbre(): number {
    const segments = this.segments;
    const totalTimbre = segments.reduce((a, b) => a + b.getTimbre(), 0);
    const averageTimbre = totalTimbre / segments.length;

    return averageTimbre;
  }

  public getMaxLoudness(): number {
    const segments = this.segments;
    const totalMaxLoudness = segments.reduce((a, b) => a + b.getMaxLoudness(), 0);
    const averageMaxLoudness = totalMaxLoudness / segments.length;

    return averageMaxLoudness;
  }
}

export default BeatModel;
