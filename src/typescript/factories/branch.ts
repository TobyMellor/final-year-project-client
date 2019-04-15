import BeatModel from '../models/audio-analysis/Beat';
import ForwardBranchModel from '../models/branches/ForwardBranch';
import BackwardBranchModel from '../models/branches/BackwardBranch';
import { ForwardAndBackwardBranch, BeatBatch, TimeIdentifier } from '../types/general';
import { BranchType } from '../types/enums';
import BranchModel from '../models/branches/Branch';
import TrackModel from '../models/audio-analysis/Track';
import ActionModel from '../models/Action';
import SongTransitionModel from '../models/SongTransition';
import * as utils from '../utils/misc';

export function createForwardAndBackwardBranch(
  track: TrackModel,
  earliestBeat: BeatModel,
  latestBeat: BeatModel,
): ForwardAndBackwardBranch {
  const options = {
    track,
    earliestBeat,
    latestBeat,
  };

  return [
    new ForwardBranchModel(options),
    new BackwardBranchModel(options),
  ];
}

export function createBranchFromType(
  track: TrackModel,
  branchType: BranchType,
  earliestBeat: BeatModel,
  latestBeat: BeatModel,
): BranchModel {
  const BranchModel = branchType === BranchType.FORWARD ? ForwardBranchModel : BackwardBranchModel;
  return new BranchModel({
    track,
    earliestBeat,
    latestBeat,
  });
}

export function createBeatBatch(fromBeat: BeatModel, nextAction: ActionModel): BeatBatch {
  // All beats between, but not including, the fromBeat and the next branch's originBeat
  const originTrack = nextAction.track;
  const beatsToNextActionOrigin = utils.getBeatsBetween(originTrack.beats,
                                                        fromBeat,
                                                        nextAction ? nextAction.originBeat
                                                                   : originTrack.beats[originTrack.beats.length - 1]);

  const originTrackBeats = [fromBeat, ...beatsToNextActionOrigin];

  if (nextAction instanceof SongTransitionModel) {
    const {
      destinationTrack,
      transitionOutEndBeat,
      transitionInStartBeat,
      transitionInEndBeat,
      transitionInEntryOffset,
    } = nextAction;
    const actionOrigin = beatsToNextActionOrigin[beatsToNextActionOrigin.length - 1];

    const originTrackTransitionOutBeats = utils.getBeatsBetween(originTrack.beats, actionOrigin, transitionOutEndBeat);
    const destinationTrackTransitionInBeats = utils.getBeatsBetween(destinationTrack.beats,
                                                                    transitionInStartBeat,
                                                                    transitionInEndBeat);

    return {
      originTrackBeats,
      originTrackTransitionOutBeats,
      destinationTrackTransitionInBeats,
      destinationTrackEntryOffset: transitionInEntryOffset,
      track: originTrack,
      action: nextAction,
    };
  }

  return {
    originTrackBeats,
    track: originTrack,
    action: nextAction,
  };
}
