import TrackModel from '../../../models/audio-analysis/Track';
import config from '../../../config';
import * as branchAnalysis from './branch-analysis';
import { ForwardAndBackwardBranches } from '../../../types/general';
import BranchModel from '../../../models/branches/Branch';
import ForwardBranchModel from '../../../models/branches/ForwardBranch';
import BackwardBranchModel from '../../../models/branches/BackwardBranch';
import * as branchFactory from '../../../factories/branch';

export class BranchManager {
  private static _managers: { [trackID: string]: BranchManager } = {};

  public forwardAndBackwardBranches: ForwardAndBackwardBranches;
  public accessibleBranches: BranchModel[];

  constructor(private _track: TrackModel) {
    this.forwardAndBackwardBranches = [[], []];
    this.accessibleBranches = [];
  }

  protected static createManager(track: TrackModel): BranchManager {
    const branchManager = new BranchManager(track);
    this._managers[track.ID] = branchManager;

    return branchManager;
  }

  public static getManager({ ID }: TrackModel): BranchManager {
    return this._managers[ID];
  }

  public createBranches(...beatPairs: branchAnalysis.SimilarBeatPair[]) {
    const [forwardBranches, backwardBranches] = this.forwardAndBackwardBranches;

    beatPairs.forEach(([firstBeat, secondBeat]) => {
      const [forwardBranch, backwardBranch] = branchFactory.createForwardAndBackwardBranch(this._track,
                                                                                           firstBeat,
                                                                                           secondBeat);
      forwardBranches.push(forwardBranch);
      backwardBranches.push(backwardBranch);
    });

    this.accessibleBranches = this.getAccessibleBranches(this.forwardAndBackwardBranches);
  }

  public static generate(track: TrackModel): ForwardAndBackwardBranches {
    const beatPairs = config.mock.shouldMockBranchCreation
                    ? branchAnalysis.getMockedSimilarBeats(track.audioAnalysis)
                    : branchAnalysis.getSimilarBeats(track.audioAnalysis);

    const branchManager = BranchManager.createManager(track);

    if (beatPairs.length) {
      // Creates and stores branches in forwardAndBackwardBranches, recalculates accessibleBranches
      branchManager.createBranches(...beatPairs);
    }

    return branchManager.forwardAndBackwardBranches;
  }

  private getAccessibleBranches([forwardBranches, backwardBranches]: ForwardAndBackwardBranches): BranchModel[] {
    if (forwardBranches.length !== backwardBranches.length) {
      throw new Error('The forward and backwards branch counts must be the same!');
    }

    function sortBranches(
      branches: ForwardBranchModel[] | BackwardBranchModel[],
    ): ForwardBranchModel[] | BackwardBranchModel[] {
      return branches.sort((a: BranchModel, b: BranchModel) => a.latestBeat.order - b.latestBeat.order);
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

    const forwardCopy = [...forwardBranches];
    const backwardCopy = [...backwardBranches];
    return [
      ...removeInaccessibleBranches(sortBranches(forwardCopy) as ForwardBranchModel[]),
      ...sortBranches(backwardCopy),
    ];
  }
}
