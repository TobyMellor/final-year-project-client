import SongTransitionModel from '../models/SongTransition';
import TrackModel from '../models/audio-analysis/Track';
import BeatModel from '../models/audio-analysis/Beat';
import { TransitionType } from '../types/enums';

export function createImmediateTransition(
  track: TrackModel,
  destinationTrack: TrackModel,
  originTransitionBeat: BeatModel,
  destinationTransitionBeat: BeatModel,
): SongTransitionModel {
  const type = TransitionType.IMMEDIATE;

  return new SongTransitionModel({
    type,
    track,
    destinationTrack,
    transitionOutStartBeat: originTransitionBeat,
    transitionOutEndBeat: originTransitionBeat,
    transitionInStartBeat: destinationTransitionBeat,
    transitionInEndBeat: destinationTransitionBeat,
  });
}
