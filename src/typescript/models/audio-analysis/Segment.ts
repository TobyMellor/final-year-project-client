import { GetAnAudioAnalysisResponseSegment } from '../../types/spotify-responses';
import * as conversions from '../../services/canvas/drawables/utils/conversions';
import { TimeIdentifier } from '../../types/general';
import TimeIntervalModel from './TimeInterval';

interface Input extends GetAnAudioAnalysisResponseSegment {
  order: number;
}

class SegmentModel extends TimeIntervalModel {
  private loudness: {
    // The onset loudness of the segment in decibels (dB). Combined with loudness_max and
    // loudness_max_time, these components can be used to desctibe the “attack” of the segment.
    start: TimeIdentifier;

    // The peak loudness of the segment in decibels (dB). Combined with loudness_start and
    // loudness_max_time, these components can be used to desctibe the “attack” of the segment.
    maxTime: TimeIdentifier;

    // The segment-relative offset of the segment peak loudness in seconds. Combined with
    // loudness_start and loudness_max, these components can be used to desctibe the “attack”
    // of the segment.
    max: number;

    // The offset loudness of the segment in decibels (dB). This value should be equivalent
    // to the loudness_start of the following segment.
    end: TimeIdentifier;
  };

  // A “chroma” vector representing the pitch content of the segment, corresponding to the
  // 12 pitch classes C, C#, D to B, with values ranging from 0 to 1 that describe the relative
  // dominance of every pitch in the chromatic scale.
  private pitch: number;

  // Timbre is the quality of a musical note or sound that distinguishes different types of
  // musical instruments, or voices. Timbre vectors are best used in comparison with each other.
  private timbre: number;

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

    this.loudness = {
      start: conversions.getTimeIdentifierFromSeconds(loudness_start),
      maxTime: conversions.getTimeIdentifierFromSeconds(loudness_max_time),
      max: loudness_max,
      end: conversions.getTimeIdentifierFromSeconds(loudness_end),
    };
    this.pitch = pitches.reduce((a, b) => a + b);
    this.timbre = timbres.reduce((a, b) => a + b);
  }

  public getMaxLoudness(): number {
    return this.loudness.max;
  }

  public getTimbre(): number {
    return this.timbre;
  }
}

export default SegmentModel;
