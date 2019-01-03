import { GetAnAudioAnalysisResponseTimeInterval } from '../../types/spotify-responses';
import * as conversions from '../../services/canvas/drawables/utils/conversions';
import { TimeIdentifier } from '../../types/general';

interface Input extends GetAnAudioAnalysisResponseTimeInterval {
  order: number;
}

class TimeIntervalModel {
  private start: TimeIdentifier;
  private duration: TimeIdentifier;
  private confidence: number;
  private order: number;

  constructor({
    start: startSeconds,
    duration: durationSeconds,
    confidence,
    order,
  }: Input) {
    this.start = conversions.getTimeIdentifierFromSeconds(startSeconds);
    this.duration = conversions.getTimeIdentifierFromSeconds(durationSeconds);
    this.confidence = confidence;
    this.order = order;
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

  public getConfidence(): number {
    return this.confidence;
  }

  public getPercentageInTrack(trackDuration: TimeIdentifier): number {
    const decimal = this.start.ms / trackDuration.ms;
    const percentage = conversions.decimalToPercentage(decimal);

    return percentage;
  }

  private getEndMs(): number {
    return this.start.ms + this.duration.ms;
  }

  public getStartAndEndMs(): [number, number] {
    const startMs = this.start.ms;
    const endMs = this.getEndMs();

    return [startMs, endMs];
  }

  public getOrder(): number {
    return this.order;
  }
}

export default TimeIntervalModel;
