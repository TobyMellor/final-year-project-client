import BeatModel from '../models/audio-analysis/Beat';
import ForwardBranchModel from '../models/branches/ForwardBranch';
import BackwardBranchModel from '../models/branches/BackwardBranch';
import { ForwardAndBackwardBranch, BeatBatch } from '../types/general';
import { BranchType } from '../types/enums';
import BranchModel from '../models/branches/Branch';
import TrackModel from '../models/audio-analysis/Track';

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

export function createBeatBatch(allBeats: BeatModel[], fromBeat: BeatModel, nextBranch: BranchModel): BeatBatch {
  // All beats between, but not including, the fromBeat and the next branch's originBeat
  const beatsBetweenFromAndOrigin = getBeatsBetween(allBeats,
                                                    fromBeat,
                                                    nextBranch ? nextBranch.originBeat : allBeats[allBeats.length - 1]);

  return {
    beatsToBranchOrigin: [fromBeat, ...beatsBetweenFromAndOrigin],
    branch: nextBranch,
  };
}

function getBeatsBetween(
  allBeats: BeatModel[],
  { order: fromBeatOrder }: BeatModel,
  { order: toBeatOrder }: BeatModel,
): BeatModel[] {
  return allBeats.slice(fromBeatOrder + 1, toBeatOrder);
}
