import SongTransitionModel from '../../../models/SongTransition';
import * as transitionFactory from '../../../factories/transition';
import * as trackFactory from '../../../factories/track';
import TrackModel from '../../../models/audio-analysis/Track';
import { TransitionType } from '../../../types/enums';

export async function getTransitions(originTrack: TrackModel): Promise<SongTransitionModel[]> {
  return []; // TODO: Implement
}

export async function getMockedTransitions(originTrack: TrackModel): Promise<SongTransitionModel[]> {
  const transitions: SongTransitionModel[] = [];

  const [
    hotlineBling,
    endGame,
  ] = await Promise.all([
    trackFactory.createTrack('0wwPcA6wtMf6HUMpIRdeP7'),
    trackFactory.createTrack('2zMMdC4xvRClYcWNFJBZ0j'),
  ]);

  function push(destinationTrack: TrackModel, originBeatOrder: number, destinationBeatOrder: number) {
    transitions.push(
      transitionFactory.createImmediateTransition(
        originTrack,
        destinationTrack,
        originTrack.beats[originBeatOrder],
        destinationTrack.beats[destinationBeatOrder],
      ),
    );
  }

  if (originTrack.ID === hotlineBling.ID) {
    push(endGame, 50, 200);
  } else if (originTrack.ID === endGame.ID) {
    push(hotlineBling, 50, 200);
  }

  return transitions;
}
