import BeatModel from '../models/audio-analysis/Beat';
import ForwardBranchModel from '../models/branches/ForwardBranch';
import BackwardBranchModel from '../models/branches/BackwardBranch';
import { ForwardAndBackwardBranch, BeatBatch } from '../types/general';
import { BranchType } from '../types/enums';
import BranchModel from '../models/branches/Branch';
import TrackModel from '../models/audio-analysis/Track';
import ActionModel from '../models/Action';

export function createForwardAndBackwardBranch(
  earliestBeat: BeatModel,
  latestBeat: BeatModel,
): ForwardAndBackwardBranch {
  const options = {
    earliestBeat,
    latestBeat,
  };

  return [
    new ForwardBranchModel(options),
    new BackwardBranchModel(options),
  ];
}

export function createBranchFromType(
  branchType: BranchType,
  earliestBeat: BeatModel,
  latestBeat: BeatModel,
): BranchModel {
  const BranchModel = branchType === BranchType.FORWARD ? ForwardBranchModel : BackwardBranchModel;
  return new BranchModel({
    earliestBeat,
    latestBeat,
  });
}

export function createBeatBatch(track: TrackModel, fromBeat: BeatModel, nextAction: ActionModel): BeatBatch {
  const beats = track.beats;

  // All beats between, but not including, the fromBeat and the next branch's originBeat
  const beatsBetweenFromAndOrigin = getBeatsBetween(beats,
                                                    fromBeat,
                                                    nextAction ? nextAction.originBeat : beats[beats.length - 1]);

  return {
    track,
    beatsToOriginBeat: [fromBeat, ...beatsBetweenFromAndOrigin],
    action: nextAction,
  };
}

function getBeatsBetween(
  beats: BeatModel[],
  { order: fromBeatOrder }: BeatModel,
  { order: toBeatOrder }: BeatModel,
): BeatModel[] {
  return beats.slice(fromBeatOrder + 1, toBeatOrder);
}
