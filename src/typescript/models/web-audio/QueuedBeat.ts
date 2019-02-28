import BeatModel from '../audio-analysis/Beat';

type Input = {
  beat: BeatModel,
  submittedCurrentTime: number,
};

class QueuedBeatModel {
  public beat: BeatModel;
  public submittedCurrentTime: number;

  constructor({ beat, submittedCurrentTime }: Input) {
    this.beat = beat;
    this.submittedCurrentTime = submittedCurrentTime;
  }

  public equals(queuedBeat: QueuedBeatModel) {
    return this.submittedCurrentTime === queuedBeat.submittedCurrentTime;
  }
}

export default QueuedBeatModel;
