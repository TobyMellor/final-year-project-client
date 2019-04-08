import TrackModel from '../../../models/audio-analysis/Track';
import config from '../../../config';
import * as branchAnalysis from './branch-analysis';
import { ForwardAndBackwardBranches, ForwardAndBackwardBranch } from '../../../types/general';
import BranchModel from '../../../models/branches/Branch';
import ForwardBranchModel from '../../../models/branches/ForwardBranch';
import BackwardBranchModel from '../../../models/branches/BackwardBranch';
import * as branchFactory from '../../../factories/branch';

export class BranchManager {
  private static _forwardAndBackwardBranches: ForwardAndBackwardBranches = [[], []];
  private static _accessibleBranches: BranchModel[] = [];

  public static getBranches(): BranchModel[] {
    return BranchManager._accessibleBranches;
  }

  public static getForwardAndBackwardBranches(): ForwardAndBackwardBranches {
    return BranchManager._forwardAndBackwardBranches;
  }

  public static createBranches(...beatPairs: branchAnalysis.SimilarBeatPair[]) {
    const [forwardBranches, backwardBranches] = this._forwardAndBackwardBranches;

    beatPairs.forEach(([firstBeat, secondBeat]) => {
      const [forwardBranch, backwardBranch] = branchFactory.createForwardAndBackwardBranch(firstBeat, secondBeat);
      forwardBranches.push(forwardBranch);
      backwardBranches.push(backwardBranch);
    });

    this._accessibleBranches = BranchManager.getAccessibleBranches(this._forwardAndBackwardBranches);
  }

  public static async generate(track: TrackModel): Promise<ForwardAndBackwardBranches> {
    const audioAnalysis = await track.getAudioAnalysis();
    const beatPairs = config.mock.shouldMockBranchCreation
                    ? branchAnalysis.getMockedSimilarBeats(audioAnalysis)
                    : branchAnalysis.getSimilarBeats(audioAnalysis);

    this._forwardAndBackwardBranches = [[], []];

    if (beatPairs.length) {
      // Creates and stores branches in _forwardAndBackwardBranches, recalculates _accessibleBranches
      this.createBranches(...beatPairs);
    }

    return this._forwardAndBackwardBranches;
  }

  private static getAccessibleBranches([forwardBranches, backwardBranches]: ForwardAndBackwardBranches): BranchModel[] {
    if (forwardBranches.length !== backwardBranches.length) {
      throw new Error('The forward and backwards branch counts must be the same!');
    }

    function sortBranches(
      branches: ForwardBranchModel[] | BackwardBranchModel[],
    ): ForwardBranchModel[] | BackwardBranchModel[] {
      return branches.sort((a: BranchModel, b: BranchModel) => b.latestBeat.order - a.latestBeat.order);
    }

    // Removes all forwardbranches leading to the last beat
    function removeInaccessibleBranches(sortedForward: ForwardBranchModel[]): ForwardBranchModel[] {
      let i = sortedForward.length - 1;
      const highestBeatOrder = sortedForward[i].latestBeat.order;

      do {
        sortedForward.pop();
        i -= 1;
      } while (i >= 0 && sortedForward[i].latestBeat.order === highestBeatOrder);

      return sortedForward;
    }

    return [
      ...removeInaccessibleBranches(sortBranches(forwardBranches) as ForwardBranchModel[]),
      ...sortBranches(backwardBranches),
    ];
  }
}
