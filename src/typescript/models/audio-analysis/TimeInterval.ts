import { GetAnAudioAnalysisResponseTimeInterval } from '../../types/spotify-responses';
import * as conversions from '../../services/canvas/drawables/utils/conversions';
import { TimeIdentifier } from '../../types/general';

abstract class TimeIntervalModel {
  private start: TimeIdentifier;
  private duration: TimeIdentifier;
  private confidence: number;

  protected constructor({
    start: startSeconds,
    duration: durationSeconds,
    confidence,
  }: GetAnAudioAnalysisResponseTimeInterval) {
    this.start = conversions.getTimeIdentifierFromSeconds(startSeconds);
    this.duration = conversions.getTimeIdentifierFromSeconds(durationSeconds);
    this.confidence = confidence;
  }

  public getStartMs(): number {
    return this.start.ms;
  }

  public getStartSecs(): number {
    return this.start.secs;
  }

  public getDurationMs(): number {
    return this.duration.ms;
  }

  public getDurationSecs(): number {
    return this.duration.secs;
  }

  public getPercentageInTrack(trackDuration: TimeIdentifier): number {
    const decimal = this.start.ms / trackDuration.ms;
    const percentage = conversions.decimalToPercentage(decimal);

    return percentage;
  }
}

export default TimeIntervalModel;
