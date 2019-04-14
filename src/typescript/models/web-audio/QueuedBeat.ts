import BeatModel from '../audio-analysis/Beat';
import { TimeIdentifier } from '../../types/general';
import * as conversions from '../../utils/conversions';
import * as utils from '../../utils/misc';

type Input = {
  originTrackBeats: BeatModel[],
  destinationTrackBeats?: BeatModel[],
  originTrackSubmittedCurrentTime: number,
  destinationTrackSubmittedCurrentTime?: number,
  durationSecs: number,
};

class QueuedSampleModel {
  public originTrackBeats: BeatModel[];
  public destinationTrackBeats?: BeatModel[];
  public originTrackSubmittedCurrentTime: number;
  public destinationTrackSubmittedCurrentTime?: number;
  private _duration: TimeIdentifier;

  constructor({
    originTrackBeats,
    destinationTrackBeats,
    originTrackSubmittedCurrentTime,
    destinationTrackSubmittedCurrentTime,
    durationSecs,
  }: Input) {
    this.originTrackBeats = originTrackBeats;
    this.destinationTrackBeats = destinationTrackBeats;
    this.originTrackSubmittedCurrentTime = originTrackSubmittedCurrentTime;
    this.destinationTrackSubmittedCurrentTime = destinationTrackSubmittedCurrentTime;
    this._duration = conversions.getTimeIdentifierFromSeconds(durationSecs);
  }

  public equals(queuedSample: QueuedSampleModel) {
    return this.originTrackSubmittedCurrentTime === queuedSample.originTrackSubmittedCurrentTime;
  }

  public get endCurrentTime() {
    return this.originTrackSubmittedCurrentTime + this._duration.secs;
  }

  public get durationSecs() {
    return this._duration.secs;
  }

  public get originTrackBeatsDurationSecs() {
    if (!this.destinationTrackBeats) {
      return this.durationSecs;
    }

    return utils.getDurationOfBeats(this.originTrackBeats).secs;
  }

  public get destinationTrackBeatsDurationSecs() {
    return utils.getDurationOfBeats(this.destinationTrackBeats || []).secs;
  }
}

export default QueuedSampleModel;
