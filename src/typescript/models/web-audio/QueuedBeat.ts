import BeatModel from '../audio-analysis/Beat';

type Input = {
  beat: BeatModel,
  submittedCurrentTime: number,
};

class QueuedBeatModel {
  private beat: BeatModel;
  private submittedCurrentTime: number;

  constructor({ beat, submittedCurrentTime }: Input) {
    this.beat = beat;
    this.submittedCurrentTime = submittedCurrentTime;
  }

  public getBeat(): BeatModel {
    return this.beat;
  }

  public getSubmittedCurrentTime(): number {
    return this.submittedCurrentTime;
  }
}

export default QueuedBeatModel;
