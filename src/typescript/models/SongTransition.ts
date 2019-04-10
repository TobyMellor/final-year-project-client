import { TransitionType } from '../types/enums';
import TrackModel from './audio-analysis/Track';
import ActionModel, { Input as ActionInput } from './Action';

export type Input = ActionInput & {
  type: TransitionType,
  destinationTrack: TrackModel,
};

class SongTransitionModel extends ActionModel {
  public type: TransitionType;
  public destinationTrack: TrackModel;

  constructor({ type, track, destinationTrack, originBeat, destinationBeat }: Input) {
    super({ track, originBeat, destinationBeat });

    if (track.ID === destinationTrack.ID) {
      throw new Error('The originTrack and destinationTrack must be different!');
    }

    this.type = type;
    this.destinationTrack = destinationTrack;
  }
}

export default SongTransitionModel;
