import BeatModel from '../audio-analysis/Beat';
import { TimeIdentifier } from '../../types/general';
import * as conversions from '../../utils/conversions';
import * as utils from '../../utils/misc';
import * as uuid from 'uuid/v4';

type Input = {
  originTrackBeats: BeatModel[],
  destinationTrackBeats?: BeatModel[],
  originTrackSubmittedCurrentTime: number,
  destinationTrackSubmittedCurrentTime?: number,
  durationSecs: number,
};

class QueuedSampleModel {
  public uuid: string;
  public originTrackBeats: BeatModel[];
  public destinationTrackBeats?: BeatModel[];
  public originTrackSubmittedCurrentTime: number;
  public destinationTrackSubmittedCurrentTime?: number;
  public duration: TimeIdentifier;

  constructor({
    originTrackBeats,
    destinationTrackBeats,
    originTrackSubmittedCurrentTime,
    destinationTrackSubmittedCurrentTime,
    durationSecs,
  }: Input) {
    this.uuid = uuid();
    this.originTrackBeats = originTrackBeats;
    this.destinationTrackBeats = destinationTrackBeats;
    this.originTrackSubmittedCurrentTime = originTrackSubmittedCurrentTime;
    this.destinationTrackSubmittedCurrentTime = destinationTrackSubmittedCurrentTime;
    this.duration = conversions.getTimeIdentifierFromSecs(durationSecs);
  }

  public equals(queuedSample: QueuedSampleModel) {
    return this.originTrackSubmittedCurrentTime === queuedSample.originTrackSubmittedCurrentTime;
  }

  public get endCurrentTime() {
    return this.originTrackSubmittedCurrentTime + this.duration.secs;
  }

  public get durationSecs() {
    return this.duration.secs;
  }

  public get durationMs() {
    return this.duration.ms;
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

  public get isTransitionSample(): boolean {
    return !!this.destinationTrackSubmittedCurrentTime;
  }
}

export default QueuedSampleModel;
