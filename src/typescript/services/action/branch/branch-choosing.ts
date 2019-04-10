import BranchModel from '../../../models/branches/Branch';

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
  const randomIndex = Math.floor(Math.random() * branches.length);
  const randomBranch = branches[randomIndex];

  return randomBranch;
}
