import Dispatcher from '../../events/Dispatcher';
import { FYPEvent } from '../../types/enums';
import BranchService from './BranchService';
import TransitionService from './TransitionService';
import ActionModel from '../../models/Action';
import TrackModel from '../../models/audio-analysis/Track';
import SongTransitionModel from '../../models/SongTransition';
import ActionService from './ActionService';
import BeatModel from '../../models/audio-analysis/Beat';
import * as branchFactory from '../../factories/branch';

enum ActionType {
  BRANCH = 'branch',
  TRANSITION = 'transition',
}

class ActionDecider {
  private _isNextTransitionReady = false;
  private _nextTransition: SongTransitionModel = null;
  private static _instance: ActionDecider = null;

  private constructor() {
    Dispatcher.getInstance()
              .on(FYPEvent.BeatBatchRequested, ({ track, beatBatchCount, nextAction }) => {
                return this.dispatchBeatBatches(track, beatBatchCount, nextAction);
              });
  }

  public static getInstance(): ActionDecider {
    return this._instance || (this._instance = new this());
  }

  private async dispatchBeatBatches(track: TrackModel, beatBatchCount: number, nextAction: ActionModel) {
    let fromBeat = nextAction && nextAction.destinationBeat || track.beats[0];

    for (let i = 0; i < beatBatchCount; i += 1) {
      fromBeat = this.dispatchBeatBatchReady(track, fromBeat);
    }
  }

  private dispatchBeatBatchReady(
    track: TrackModel,
    fromBeat: BeatModel,
  ): BeatModel {
    const nextAction = this.getAndLoadNext(track, fromBeat.startMs);
    const beatBatch = branchFactory.createBeatBatch(track, fromBeat, nextAction);

    Dispatcher.getInstance()
              .dispatch(FYPEvent.BeatBatchReady, {
                beatBatch,
              });

    const lastBeatInThisBatch = nextAction.destinationBeat;
    return lastBeatInThisBatch;
  }

  private getAndLoadNext(track: TrackModel, fromMs: number): ActionModel {
    // If the track we requested to transition to has loaded, transition now
    if (this._isNextTransitionReady) {
      this._isNextTransitionReady = false;

      return this._nextTransition;
    }

    const nextActionType = this.getNextActionType();
    const nextActionService = this.getActionService(nextActionType);
    const nextAction = nextActionService.getNext(track, fromMs);

    if (nextActionType === ActionType.TRANSITION) {
      this._nextTransition = nextAction as SongTransitionModel;
      this.dispatchTrackChangeRequested(this._nextTransition.destinationTrack);

      // The next track we'll transition to is now loading. Request branches until it's loaded
      return this.getAndLoadNext(track, fromMs);
    }

    return nextAction;
  }

  private getNextActionType(): ActionType {
    // If we've requested to take a transition, but it's not loaded yet
    if (this._nextTransition) {
      return ActionType.BRANCH;
    }

    // TODO: Implement ability to return ActionType.TRANSITION
    return ActionType.BRANCH;
  }

  private getActionService(actionType: ActionType): ActionService {
    switch (actionType) {
      case ActionType.BRANCH:
        return BranchService.getInstance();
      case ActionType.TRANSITION:
        return TransitionService.getInstance();
      default:
        throw new Error('ActionType not found!');
    }
  }

  private dispatchTrackChangeRequested(track: TrackModel) {
    Dispatcher.getInstance()
              .dispatch(FYPEvent.TrackChangeRequested, {
                track,
              });
  }
}

export default ActionDecider;
