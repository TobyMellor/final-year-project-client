import BranchModel from '../../../models/branches/Branch';
import config from '../../../config';

export function getNextBranch(branches: BranchModel[], fromMs: number) {
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

  let currentProbability = config.choosing.minimumChanceProbability;
  const probabilityIncreaseAmount = (1 - config.choosing.minimumChanceProbability) / branches.length;

  for (let i = 0; i < sortedBranches.length; i += 1) {
    currentProbability += probabilityIncreaseAmount;

    if (Math.random() <= currentProbability) {
      return sortedBranches[i];
    }
  }
}
