export type Input = {
  start: number;
  duration: number;
  confidence: number;
};

abstract class TimeInterval {
  private start: number;
  private duration: number;
  private confidence: number;

  protected constructor({ start, duration, confidence }: Input) {
    this.start = start;
    this.duration = duration;
    this.confidence = confidence;
  }
}

export default TimeInterval;
