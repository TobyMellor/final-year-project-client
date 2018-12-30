import { GetAnAudioAnalysisResponseSegment } from '../../types/spotify-responses';

class SegmentModel {
  // The starting point (in seconds) of the segment.
  private startMs: number;

  // The duration (in seconds) of the segment.
  private durationMs: number;

  // The confidence, from 0.0 to 1.0, of the reliability of the segmentation. Segments
  // of the song which are difficult to logically segment (e.g: noise) may correspond
  // to low values in this field.
  private confidence: number;

  private loudness: {
    // The onset loudness of the segment in decibels (dB). Combined with loudness_max and
    // loudness_max_time, these components can be used to desctibe the “attack” of the segment.
    startMs: number;

    // The peak loudness of the segment in decibels (dB). Combined with loudness_start and
    // loudness_max_time, these components can be used to desctibe the “attack” of the segment.
    maxTimeMs: number;

    // The segment-relative offset of the segment peak loudness in seconds. Combined with
    // loudness_start and loudness_max, these components can be used to desctibe the “attack”
    // of the segment.
    max: number;

    // The offset loudness of the segment in decibels (dB). This value should be equivalent
    // to the loudness_start of the following segment.
    endMs: number;
  };

  // A “chroma” vector representing the pitch content of the segment, corresponding to the
  // 12 pitch classes C, C#, D to B, with values ranging from 0 to 1 that describe the relative
  // dominance of every pitch in the chromatic scale.
  private pitches: number[];

  // Timbre is the quality of a musical note or sound that distinguishes different types of
  // musical instruments, or voices. Timbre vectors are best used in comparison with each other.
  private timbre: number[];

  constructor({
    start,
    duration,
    confidence,
    loudness_start,
    loudness_max_time,
    loudness_max,
    loudness_end,
    pitches,
    timbre,
  }: GetAnAudioAnalysisResponseSegment) {
    this.startMs = start;
    this.durationMs = duration;
    this.confidence = confidence;
    this.loudness = {
      startMs: loudness_start,
      maxTimeMs: loudness_max_time,
      max: loudness_max,
      endMs: loudness_end,
    };
    this.pitches = pitches;
    this.timbre = timbre;
  }
}

export default SegmentModel;
