import { TransitionType } from '../types/enums';
import TrackModel from './audio-analysis/Track';
import ActionModel, { Input as ActionInput } from './Action';

export type Input = ActionInput & {
  type: TransitionType,
  originTrack: TrackModel,
  destinationTrack: TrackModel,
};

class SongTransitionModel extends ActionModel {
  public type: TransitionType;
  public originTrack: TrackModel;
  public destinationTrack: TrackModel;

  constructor({ type, originTrack, destinationTrack, originBeat, destinationBeat }: Input) {
    super({ originBeat, destinationBeat });

    if (originTrack.ID === destinationTrack.ID) {
      throw new Error('The originTrack and destinationTrack must be different!');
    }

    this.type = type;
    this.originTrack = originTrack;
    this.destinationTrack = destinationTrack;
  }
}

export default SongTransitionModel;
