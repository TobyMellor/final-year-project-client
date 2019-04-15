import { FYPEvent } from '../../types/enums';
import Dispatcher from '../../events/Dispatcher';
import SongTransitionModel from '../../models/SongTransition';
import TrackModel from '../../models/audio-analysis/Track';
import ActionService from './ActionService';
import { TransitionManager } from './transition/transition-management';
import { FYPEventPayload } from '../../types/general';

class TransitionService extends ActionService {
  private static _instance: TransitionService = null;

  private constructor() {
    super();

    Dispatcher.getInstance()
              .on(FYPEvent.BranchesAnalyzed, ({ track }: FYPEventPayload['BranchesAnalyzed']) => {
                super.generateAndDispatchActions(track);
              });
  }

  public static getInstance(): TransitionService {
    return this._instance || (this._instance = new this());
  }

  protected async generateActions(track: TrackModel): Promise<SongTransitionModel[]> {
    return TransitionManager.generate(track);
  }

  public getNext(track: TrackModel, fromMs: number): SongTransitionModel {
    const transitions = TransitionManager.getManager(track).transitions;
    const randomIndex = Math.floor(Math.random() * transitions.length);
    const randomTransition = transitions[randomIndex];

    return randomTransition;
  }

  protected dispatchActions(track: TrackModel, transitions: SongTransitionModel[]) {
    Dispatcher.getInstance()
              .dispatch(FYPEvent.TransitionsAnalyzed, {
                track,
                transitions,
              } as FYPEventPayload['TransitionsAnalyzed']);
  }
}

export default TransitionService;
