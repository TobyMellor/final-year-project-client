import { GetAnAudioAnalysisResponseSegment } from '../../types/spotify-responses';
import * as conversions from '../../utils/conversions';
import { TimeIdentifier } from '../../types/general';
import TimeIntervalModel from './TimeInterval';

interface Input extends GetAnAudioAnalysisResponseSegment {
  order: number;
}

class SegmentModel extends TimeIntervalModel {
  private _loudness: {
    // The onset loudness of the segment in decibels (dB). Combined with loudness_max and
    // loudness_max_time, these components can be used to desctibe the “attack” of the segment.
    start: TimeIdentifier | null;

    // The peak loudness of the segment in decibels (dB). Combined with loudness_start and
    // loudness_max_time, these components can be used to desctibe the “attack” of the segment.
    maxTime: TimeIdentifier;

    // The segment-relative offset of the segment peak loudness in seconds. Combined with
    // loudness_start and loudness_max, these components can be used to desctibe the “attack”
    // of the segment.
    max: number;

    // The offset loudness of the segment in decibels (dB). This value should be equivalent
    // to the loudness_start of the following segment.
    end: TimeIdentifier | null;
  };

  // A “chroma” vector representing the pitch content of the segment, corresponding to the
  // 12 pitch classes C, C#, D to B, with values ranging from 0 to 1 that describe the relative
  // dominance of every pitch in the chromatic scale.
  private _pitch: number;

  // Timbre is the quality of a musical note or sound that distinguishes different types of
  // musical instruments, or voices. Timbre vectors are best used in comparison with each other.
  private _timbre: number;

  constructor({
    start,
    duration,
    confidence,
    order,
    loudness_start,
    loudness_max_time,
    loudness_max,
    loudness_end,
    pitches,
    timbre: timbres,
  }: Input) {
    super({ start, duration, confidence, order });
    this._loudness = {
      start: conversions.getTimeIdentifierFromSeconds(loudness_start),
      maxTime: conversions.getTimeIdentifierFromSeconds(loudness_max_time),
      max: loudness_max,
      end: conversions.getTimeIdentifierFromSeconds(loudness_end),
    };
    this._pitch = pitches.reduce((a, b) => a + b);
    this._timbre = timbres.reduce((a, b) => a + b);
  }

  public get startLoudnessMs(): number | null {
    if (!this._loudness.start) {
      return null;
    }

    return this._loudness.start.ms;
  }

  public get maxTimeLoudnessMs(): number {
    return this._loudness.maxTime.ms;
  }

  public get maxLoudness(): number {
    return this._loudness.max;
  }

  public get endLoudnessMs(): number {
    if (!this._loudness.end) {
      return null;
    }

    return this._loudness.end.ms;
  }

  public get timbre(): number {
    return this._timbre;
  }
}

export default SegmentModel;
