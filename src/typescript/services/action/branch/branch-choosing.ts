import BranchModel from '../../../models/branches/Branch';
import config from '../../../config';
import * as math from '../../../utils/math';
import Translator from '../../../../translations/Translator';

export function getNextBranch(branches: BranchModel[], fromMs: number, targetMs?: number): BranchModel | null {
  if (targetMs) {
    return getNextBranchTowardsTarget(branches, fromMs, targetMs);
  }

  const futureBranches = getFutureBranches(branches, fromMs);
  const nextBranch = getBestBranch(futureBranches);

  return nextBranch;
}

function getFutureBranches(
  branches: BranchModel[],
  beyondTimeMs: number,
): BranchModel[] {
  if (beyondTimeMs === 0) {
    return branches;
  }

  return branches.filter(({ originBeat }) => {
    return originBeat.startMs > beyondTimeMs;
  });
}

function getBestBranch(branches: BranchModel[]): BranchModel {
  const sortedBranches = branches.sort((a, b) => a.originBeat.order - b.originBeat.order);

  let currentProbability = config.choosing.minimumBranchProbability;
  const probabilityIncreaseAmount = (1 - config.choosing.minimumBranchProbability) / branches.length;

  for (let i = 0; i < sortedBranches.length; i += 1) {
    currentProbability += probabilityIncreaseAmount;

    if (Math.random() <= currentProbability) {
      return sortedBranches[i];
    }
  }
}

/**
 * Retrieves the first branch in a sequence that will get to a target
 * point the quickest.
 *
 * No branch is returned if the straight line distance is optimal
 *
 * @param branches All branches in the song
 * @param fromMs Where to start the sequence from
 * @param targetMs Where to end the sequence
 */
function getNextBranchTowardsTarget(branches: BranchModel[], fromMs: number, targetMs: number): BranchModel | null {
  const { distanceToTarget, choicePath } = getPathTowardsTarget(branches, fromMs, targetMs);

  if (distanceToTarget === Infinity) {
    throw new Error(Translator.errors.action.invalid_branch_target);
  }

  return choicePath.shift() || null;
}

type PathToTarget = {
  distanceToTarget: number,
  choicePath: BranchModel[],
};

/**
 * Retrieves the sequence of branches that arrives at a target point
 * in the quickest time possible
 *
 * @param branches All branches in the song
 * @param fromMs Where to start the sequence from
 * @param targetMs Where to end the sequence
 * @param memo Used for optimization
 */
function getPathTowardsTarget(
  branches: BranchModel[],
  fromMs: number,
  targetMs: number,
  memo: { [fromMs: number]: PathToTarget } = {},
): PathToTarget {
  if (memo[fromMs]) {
    return memo[fromMs];
  }

  let branchesToTarget: BranchModel[];
  if (fromMs < targetMs) {
    branchesToTarget = branches.filter((branch) => {
      return fromMs < branch.originBeat.startMs && branch.originBeat.startMs < targetMs;
    });
  } else {
    branchesToTarget = branches.filter((branch) => {
      return branch.originBeat.startMs > fromMs;
    });
  }

  // No branches between fromMs and the targetMs, so return the straight line distance
  if (!branchesToTarget.length) {
    const distanceToTarget = getStraightLineDistance(fromMs, targetMs);

    memo[fromMs] = {
      distanceToTarget,
      choicePath: [],
    };

    return memo[fromMs];
  }

  // For each branch, add the straight line distance to the origin plus a recursive call to this fn
  const pathsToTarget = [
    ...branchesToTarget.map((branch) => {
      const distanceToOrigin = getStraightLineDistance(fromMs, branch.originBeat.startMs);
      const otherBranches = branchesToTarget.filter(otherBranch => !BranchModel.isSameBranch(branch, otherBranch));
      const pathBranchToTarget = getPathTowardsTarget(otherBranches,
                                                      branch.destinationBeat.startMs,
                                                      targetMs,
                                                      memo);

      return {
        distanceToTarget: distanceToOrigin + pathBranchToTarget.distanceToTarget,
        choicePath: [branch, ...pathBranchToTarget.choicePath],
      };
    }),
    {
      distanceToTarget: getStraightLineDistance(fromMs, targetMs),
      choicePath: [],
    },
  ];

  // Return the path with minimum cost
  memo[fromMs] = pathsToTarget.reduce((prev, curr) => prev.distanceToTarget < curr.distanceToTarget ? prev : curr);
  return memo[fromMs];
}

/**
 * The distance between two points in a song
 * if no branches were taken. If no direct path is available,
 * the result is Infinity
 *
 * @param fromMs The first point in the song
 * @param toMs The second point in the song
 */
function getStraightLineDistance(fromMs: number, toMs: number): number {
  if (fromMs > toMs) {
    return Infinity;
  }

  return math.distance(fromMs, toMs);
}
