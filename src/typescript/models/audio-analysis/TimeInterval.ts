import { GetAnAudioAnalysisResponseTimeInterval } from '../../types/spotify-responses';
import * as conversions from '../../services/canvas/drawables/utils/conversions';

abstract class TimeIntervalModel {
  private startMs: number;
  private durationMs: number;
  private confidence: number;

  protected constructor({
    start: startSeconds,
    duration: durationSeconds,
    confidence,
  }: GetAnAudioAnalysisResponseTimeInterval) {
    this.startMs = conversions.secondsToMilliseconds(startSeconds);
    this.durationMs = conversions.secondsToMilliseconds(durationSeconds);
    this.confidence = confidence;
  }

  public getStartMs(): number {
    return this.startMs;
  }

  public getDurationMs(): number {
    return this.durationMs;
  }

  public getPercentageInTrack(trackDurationMs: number): number {
    const decimal = this.startMs / trackDurationMs;
    const percentage = conversions.decimalToPercentage(decimal);

    return percentage;
  }
}

export default TimeIntervalModel;
