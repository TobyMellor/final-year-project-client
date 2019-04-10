import { FYPEvent } from '../../types/enums';
import Dispatcher from '../../events/Dispatcher';
import SongTransitionModel from '../../models/SongTransition';
import TrackModel from '../../models/audio-analysis/Track';
import ActionService from './ActionService';
import { TransitionManager } from './transition/transition-management';

class TransitionService extends ActionService {
  private static _instance: TransitionService = null;

  private constructor() {
    super();

    Dispatcher.getInstance()
              .on(FYPEvent.BranchesAnalyzed, ({ track }) => super.generateAndDispatchActions(track));
  }

  public static getInstance(): TransitionService {
    return this._instance || (this._instance = new this());
  }

  protected async generateActions(track: TrackModel): Promise<SongTransitionModel[]> {
    return TransitionManager.generate(track);
  }

  public getNext(track: TrackModel, fromMs: number): SongTransitionModel {
    return null; // TODO: Implement
  }

  protected dispatchActions(track: TrackModel, transitions: SongTransitionModel[]) {
    Dispatcher.getInstance()
              .dispatch(FYPEvent.TransitionsAnalyzed, {
                track,
                transitions,
              });
  }
}

export default TransitionService;
