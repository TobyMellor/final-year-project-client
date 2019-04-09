import { TransitionType } from '../types/enums';
import TrackModel from './audio-analysis/Track';
import BeatModel from './audio-analysis/Beat';

export type Input = {
  type: TransitionType,
  originTrack: TrackModel,
  destinationTrack: TrackModel,
  originBeat: BeatModel,
  destinationBeat: BeatModel,
};

class SongTransition {
  public type: TransitionType;
  public originTrack: TrackModel;
  public destinationTrack: TrackModel;
  public originBeat: BeatModel;
  public destinationBeat: BeatModel;

  constructor({ type, originTrack, destinationTrack, originBeat, destinationBeat }: Input) {
    this.type = type;
    this.originTrack = originTrack;
    this.destinationTrack = destinationTrack;
    this.originBeat = originBeat;
    this.destinationBeat = destinationBeat;
  }
}

export default SongTransition;
