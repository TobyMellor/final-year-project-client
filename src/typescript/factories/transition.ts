import SongTransitionModel from '../models/SongTransition';
import TrackModel from '../models/audio-analysis/Track';
import BeatModel from '../models/audio-analysis/Beat';
import { TransitionType } from '../types/enums';

export function createTransition(
  type: TransitionType,
  originTrack: TrackModel,
  destinationTrack: TrackModel,
  originBeat: BeatModel,
  destinationBeat: BeatModel,
): SongTransitionModel {
  return new SongTransitionModel({
    type,
    originTrack,
    destinationTrack,
    originBeat,
    destinationBeat,
  });
}
