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
    hotlingBling,
  ] = await Promise.all([
    trackFactory.createTrack('4RVbK6cV0VqWdpCDcx3hiT'),
    trackFactory.createTrack('3aUFrxO1B8EW63QchEl3wX'),
    trackFactory.createTrack('2hmHlBM0kPBm17Y7nVIW9f'),
    trackFactory.createTrack('6wVWJl64yoTzU27EI8ep20'),
    trackFactory.createTrack('3O8NlPh2LByMU9lSRSHedm'),
    trackFactory.createTrack('0wwPcA6wtMf6HUMpIRdeP7'),
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
    push(feelTheLove, 50, 100);
    push(myPropeller, 124, 76);
    push(cryingLightning, 76, 200);
    push(controlla, 175, 234);
    push(hotlingBling, 253, 122);
  } else if (originTrack.ID === feelTheLove.ID) {
    // Mock goes here
  } else if (originTrack.ID === myPropeller.ID) {
    // Mock goes here
  } else if (originTrack.ID === cryingLightning.ID) {
    // Mock goes here
  } else if (originTrack.ID === controlla.ID) {
    // Mock goes here
  } else if (originTrack.ID === hotlingBling.ID) {
    // Mock goes here
  }

  return transitions;
}
