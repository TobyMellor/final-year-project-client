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
    reborn,
    feelTheLove,
    myPropeller,
    cryingLightning,
    controlla,
    hotlineBling,
    endGame,
    lookWhatYouMadeMeDo,
  ] = await Promise.all([
    trackFactory.createTrack('4RVbK6cV0VqWdpCDcx3hiT'),
    trackFactory.createTrack('3aUFrxO1B8EW63QchEl3wX'),
    trackFactory.createTrack('2hmHlBM0kPBm17Y7nVIW9f'),
    trackFactory.createTrack('6wVWJl64yoTzU27EI8ep20'),
    trackFactory.createTrack('3O8NlPh2LByMU9lSRSHedm'),
    trackFactory.createTrack('0wwPcA6wtMf6HUMpIRdeP7'),
    trackFactory.createTrack('2zMMdC4xvRClYcWNFJBZ0j'),
    trackFactory.createTrack('1JbR9RDP3ogVNEWFgNXAjh'),
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

  if (originTrack.ID === reborn.ID) {
    // push(feelTheLove, 400, 100);
    // push(myPropeller, 175, 76);
    // push(cryingLightning, 312, 200);
    push(hotlineBling, 40, 40);
    // push(hotlineBling, 253, 122);
  } else if (originTrack.ID === feelTheLove.ID) {
    push(myPropeller, 124, 76);
    push(cryingLightning, 50, 200);
    push(controlla, 175, 234);
  } else if (originTrack.ID === myPropeller.ID) {
    // Mock goes here
  } else if (originTrack.ID === cryingLightning.ID) {
    push(myPropeller, 124, 76);
    push(controlla, 175, 234);
  } else if (originTrack.ID === controlla.ID) {
    // Mock goes here
  } else if (originTrack.ID === hotlineBling.ID) {
    push(myPropeller, 124, 76);
    push(cryingLightning, 50, 200);
    push(controlla, 175, 234);
  } else if (originTrack.ID === endGame.ID) {
    // Mock goes here
  } else if (originTrack.ID === lookWhatYouMadeMeDo.ID) {
    push(cryingLightning, 150, 250);
    push(endGame, 300, 100);
  }

  return transitions;
}
