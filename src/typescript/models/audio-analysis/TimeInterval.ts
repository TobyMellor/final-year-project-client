import { GetAnAudioAnalysisResponseTimeInterval } from '../../types/spotify-responses';

abstract class TimeInterval {
  private start: number;
  private duration: number;
  private confidence: number;

  protected constructor({ start, duration, confidence }: GetAnAudioAnalysisResponseTimeInterval) {
    this.start = start;
    this.duration = duration;
    this.confidence = confidence;
  }
}

export default TimeInterval;
