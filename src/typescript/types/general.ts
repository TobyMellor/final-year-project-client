import SegmentModel from '../models/audio-analysis/Segment';
import BeatModel from '../models/audio-analysis/Beat';
import BarModel from '../models/audio-analysis/Bar';

export type TimeIdentifier = {
  ms: number,
  secs: number,
};

export interface CreateBarsBeatsAndSegments extends CreateSegments {
  bars: BarModel[];
  beats: BeatModel[];
}

export interface CreateSegments {
  segments: SegmentModel[];
  maxTimbre: number;
  minTimbre: number;
  maxLoudness: number;
  minLoudness: number;
}
