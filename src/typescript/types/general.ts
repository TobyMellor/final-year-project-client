import SegmentModel from '../models/audio-analysis/Segment';
import BeatModel from '../models/audio-analysis/Beat';
import BarModel from '../models/audio-analysis/Bar';

export type TimeIdentifier = {
  ms: number,
  secs: number,
};

export interface CreateBarsBeatsAndSegments {
  bars: BarModel[];
  beats: BeatModel[];
  segments: SegmentModel[];
}

export type BeatListInfo = {
  queued: UIBeatType[];
  playing: UIBeatType;
  selected: UIBeatType;
  disabled: UIBeatType[];
  lastKnownScrollPosition?: number;
};

export interface UIBeatType {
  order: number;
  barOrder: number;
  timbreNormalized: number;
  loudnessNormalized: number;
  durationMs: number;
}

export interface UIBarType {
  order: number;
  beats: UIBeatType[];
}

export interface QueuedUIBeat extends UIBeatType {
  orientation: string;
}
