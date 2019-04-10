import TrackModel from '../../../models/audio-analysis/Track';
import config from '../../../config';
import * as transitionAnalysis from './transition-analysis';
import SongTransitionModel from '../../../models/SongTransition';

export class TransitionManager {
  private static _managers: { [trackID: string]: TransitionManager } = {};
  private _transitions: SongTransitionModel[];

  constructor(transitions: SongTransitionModel[]) {
    this._transitions = transitions;
  }

  private static createManager({ ID }: TrackModel, transitions: SongTransitionModel[]): TransitionManager {
    const transitionManager = new TransitionManager(transitions);
    TransitionManager._managers[ID] = transitionManager;

    return transitionManager;
  }

  public static getManager({ ID }: TrackModel): TransitionManager {
    return TransitionManager._managers[ID];
  }

  public static async generate(track: TrackModel): Promise<SongTransitionModel[]> {
    const transitions = config.mock.shouldMockTransitionCreation
                      ? await transitionAnalysis.getMockedTransitions(track)
                      : await transitionAnalysis.getTransitions(track);

    TransitionManager.createManager(track, transitions);

    return transitions;
  }
}
