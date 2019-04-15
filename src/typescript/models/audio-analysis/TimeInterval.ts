import { GetAnAudioAnalysisResponseTimeInterval } from '../../types/spotify-responses';
import * as conversions from '../../utils/conversions';
import { TimeIdentifier } from '../../types/general';

interface Input extends GetAnAudioAnalysisResponseTimeInterval {
  order: number;
}

class TimeIntervalModel {
  private _start: TimeIdentifier;
  private _duration: TimeIdentifier;
  private _confidence: number;
  private _order: number;

  constructor({
    start: startSeconds,
    duration: durationSeconds,
    confidence,
    order,
  }: Input) {
    this._start = conversions.getTimeIdentifierFromSecs(startSeconds);
    this._duration = conversions.getTimeIdentifierFromSecs(durationSeconds);
    this._confidence = confidence;
    this._order = order;
  }

  public get startMs(): number {
    return this._start.ms;
  }

  public get startSecs(): number {
    return this._start.secs;
  }

  public get durationMs(): number {
    return this._duration.ms;
  }

  public get durationSecs(): number {
    return this._duration.secs;
  }

  public get confidence(): number {
    return this._confidence;
  }

  public getPercentageInTrack(trackDuration: TimeIdentifier): number {
    const decimal = this._start.ms / trackDuration.ms;
    const percentage = conversions.decimalToPercentage(decimal);

    return percentage;
  }

  public get endMs(): number {
    return this._start.ms + this._duration.ms;
  }

  public get startAndEndMs(): [number, number] {
    const startMs = this._start.ms;
    const endMs = this.endMs;

    return [startMs, endMs];
  }

  public get order(): number {
    return this._order;
  }
}

export default TimeIntervalModel;
