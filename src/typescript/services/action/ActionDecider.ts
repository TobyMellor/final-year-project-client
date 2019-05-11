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
import { FYPEventPayload } from '../../types/general';
import * as misc from '../../utils/misc';
import config from '../../config';
import Translator from '../../../translations/Translator';

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
              .on(FYPEvent.BeatBatchRequested, ({
                track,
                action,
                beatBatchCount,
                fromMs,
              }: FYPEventPayload['BeatBatchRequested']) => {
                return this.dispatchBeatBatches(track, action, beatBatchCount, fromMs);
              });

    Dispatcher.getInstance()
              .on(FYPEvent.TrackChangeReady, ({ track }: FYPEventPayload['TrackChangeReady']) => {
                if (this._nextTransition && this._nextTransition.destinationTrack.ID === track.ID) {
                  this._isNextTransitionReady = true;
                }
              });

    Dispatcher.getInstance()
              .on(FYPEvent.TrackChanged, () => {
                this._isNextTransitionReady = false;
                this._nextTransition = null;
              });
  }

  public static getInstance(): ActionDecider {
    return this._instance || (this._instance = new this());
  }

  private async dispatchBeatBatches(track: TrackModel, action: ActionModel, beatBatchCount: number, fromMs?: number) {
    let fromTrack = track;
    let fromBeat = action ? action.destinationBeat : misc.getBeatFromMs(track.beats, fromMs || 0);

    for (let i = 0; i < beatBatchCount; i += 1) {
      [fromTrack, fromBeat] = this.dispatchBeatBatchReady(fromTrack, fromBeat);
    }
  }

  private dispatchBeatBatchReady(track: TrackModel, fromBeat: BeatModel): [TrackModel, BeatModel] {
    const nextAction = this.getAndLoadNext(track, fromBeat.startMs);
    const beatBatch = branchFactory.createBeatBatch(fromBeat, nextAction);

    Dispatcher.getInstance()
              .dispatch(FYPEvent.BeatBatchReady, {
                beatBatch,
              } as FYPEventPayload['BeatBatchReady']);

    const lastBeatInThisBatch = nextAction.destinationBeat;
    const destinationTrack = nextAction instanceof SongTransitionModel ? nextAction.destinationTrack : track;

    return [destinationTrack, lastBeatInThisBatch];
  }

  private getAndLoadNext(track: TrackModel, fromMs: number, actionType: ActionType = null): ActionModel {
    // If the track we requested to transition to has loaded, transition now
    if (this._isNextTransitionReady) { // TODO: Implement
      const nextTransition = this._nextTransition;

      this._nextTransition = null;
      this._isNextTransitionReady = false;

      return nextTransition;
    }

    const nextActionType = actionType ? actionType : this.getNextActionType();
    const nextActionService = this.getActionService(nextActionType);
    const nextAction = nextActionService.getNext(track, fromMs);

    if (!nextAction && !actionType) {
      return this.getAndLoadNext(track, fromMs, ActionType.BRANCH);
    }

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

    const random = Math.random();
    if (random < config.choosing.minimumTransitionProbability) {
      config.choosing.minimumTransitionProbability = 0; // FIXME: Should be dynamic
      return ActionType.TRANSITION;
    }

    return ActionType.BRANCH;
  }

  private getActionService(actionType: ActionType): ActionService {
    switch (actionType) {
      case ActionType.BRANCH:
        return BranchService.getInstance();
      case ActionType.TRANSITION:
        return TransitionService.getInstance();
      default:
        throw new Error(Translator.errors.action.not_found);
    }
  }

  private dispatchTrackChangeRequested(track: TrackModel) {
    Dispatcher.getInstance()
              .dispatch(FYPEvent.TrackChangeRequested, {
                track,
              } as FYPEventPayload['TrackChangeRequested']);
  }
}

export default ActionDecider;
