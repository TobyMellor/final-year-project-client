import TrackModel from '../../../models/audio-analysis/Track';
import config from '../../../config';
import * as branchAnalysis from './branch-analysis';
import { ForwardAndBackwardBranches } from '../../../types/general';
import BranchModel from '../../../models/branches/Branch';
import ForwardBranchModel from '../../../models/branches/ForwardBranch';
import BackwardBranchModel from '../../../models/branches/BackwardBranch';
import * as branchFactory from '../../../factories/branch';
import * as math from '../../../utils/math';
import Translator from '../../../../translations/Translator';

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
      throw new Error(Translator.errors.action.invalid_branch_manager);
    }

    const allBranches = [...forwardBranches, ...backwardBranches];
    const branchesInOrBeforeLargestCluster = getBranchesInOrBeforeLargestCluster(allBranches);
    const [forwardCopy, backwardCopy] = toForwardAndBackwardBranches(branchesInOrBeforeLargestCluster);

    return [
      ...removeInaccessibleForwardBranches(forwardCopy),
      ...backwardCopy,
    ];
  }
}

// Removes all forwardbranches leading to the last beat
function removeInaccessibleForwardBranches(forwardBranches: ForwardBranchModel[]): ForwardBranchModel[] {
  const sortedForward = forwardBranches.sort((a, b) => a.latestBeat.order - b.latestBeat.order);
  let i = sortedForward.length - 1;
  const highestBeatOrder = sortedForward[i].latestBeat.order;

  do {
    sortedForward.pop();
    i -= 1;
  } while (i >= 0 && sortedForward[i].latestBeat.order === highestBeatOrder);

  return sortedForward;
}

function getBranchesInOrBeforeLargestCluster(branches: BranchModel[]): BranchModel[] {
  const clusters = getClusters(branches);
  const branchesInOrBeforeLargestCluster: BranchModel[] = [];
  let largestClusterSize: number = null;

  function getClusterSize(cluster: BranchModel[]) {
    const earliestBeatOrder = cluster[0].earliestBeat.order;
    const largestBeatOrder = Math.max(...cluster.map(branch => branch.latestBeat.order));

    return math.distance(earliestBeatOrder, largestBeatOrder);
  }

  clusters.forEach((cluster) => {
    const clusterSize = getClusterSize(cluster);

    if (!largestClusterSize || largestClusterSize <= clusterSize) {
      largestClusterSize = clusterSize;
      branchesInOrBeforeLargestCluster.push(...cluster);
    }
  });

  return branchesInOrBeforeLargestCluster;
}

function getClusters(branches: BranchModel[]): BranchModel[][] {
  const sortedBranches = branches.sort((a, b) => a.earliestBeat.order - b.latestBeat.order);

  let clusterEndOrder: number = null;
  const clusters: BranchModel[][] = [];

  sortedBranches.forEach((branch) => {
    const earliestBeatOrder = branch.earliestBeat.order;
    const latestBeatOrder = branch.latestBeat.order;

    // Begin the first cluster or start another
    if (!clusterEndOrder || clusterEndOrder < earliestBeatOrder) {
      clusterEndOrder = latestBeatOrder;
      clusters.push([branch]);
      return;
    }

    // Starts within the cluster
    if (clusterEndOrder >= earliestBeatOrder) {
      // Extends the cluster
      if (clusterEndOrder < latestBeatOrder) {
        clusterEndOrder = latestBeatOrder;
      }

      clusters[clusters.length - 1].push(branch);
    }
  });

  return clusters;
}

function toForwardAndBackwardBranches(branches: BranchModel[]): ForwardAndBackwardBranches {
  const forwardBranches: ForwardBranchModel[] = [];
  const backwardBranches: BackwardBranchModel[] = [];

  branches.forEach((branch) => {
    if (branch instanceof ForwardBranchModel) {
      forwardBranches.push(branch);
    } else {
      backwardBranches.push(branch);
    }
  });

  return [forwardBranches, backwardBranches];
}
