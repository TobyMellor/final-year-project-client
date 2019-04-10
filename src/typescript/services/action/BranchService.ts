import { FYPEvent } from '../../types/enums';
import BranchModel from '../../models/branches/Branch';
import { BranchManager } from './branch/branch-management';
import BeatModel from '../../models/audio-analysis/Beat';
import TrackModel from '../../models/audio-analysis/Track';
import BackwardBranchModel from '../../models/branches/BackwardBranch';
import Dispatcher from '../../events/Dispatcher';
import * as branchChooser from './branch/branch-choosing';
import ActionService from './ActionService';

class BranchService extends ActionService {
  private static _instance: BranchService = null;

  private constructor() {
    super();

    Dispatcher.getInstance()
              .on(FYPEvent.TrackChangeRequested, ({ track }) => super.generateAndDispatchActions(track));
  }

  public static getInstance(): BranchService {
    return this._instance || (this._instance = new this());
  }

  protected async generateActions(track: TrackModel): Promise<BranchModel[]> {
    const [_, backwardBranches] = BranchManager.generate(track);

    return backwardBranches;
  }

  public getNext(track: TrackModel, fromMs: number): BranchModel {
    const branches = BranchManager.getManager(track)
                                     .accessibleBranches;
    const nextBranch = branchChooser.getNextBranch(branches, fromMs);

    return nextBranch;
  }

  public createBranch(track: TrackModel, firstBeat: BeatModel, secondBeat: BeatModel) {
    const [earliestBeat, latestBeat] = firstBeat.order < secondBeat.order
                                     ? [firstBeat, secondBeat]
                                     : [secondBeat, firstBeat];

    BranchManager.getManager(track)
                 .createBranches([earliestBeat, latestBeat]);

    this.dispatchBranchAdded([
      new BackwardBranchModel({
        earliestBeat,
        latestBeat,
      }),
    ]);
  }

  protected dispatchActions(branches: BranchModel[]) {
    Dispatcher.getInstance()
              .dispatch(FYPEvent.BranchesAnalyzed, {
                branches,
              });
  }

  private dispatchBranchAdded(branchesAdded: BranchModel[]) {
    Dispatcher.getInstance()
              .dispatch(FYPEvent.PlayingTrackBranchAdded, {
                branchesAdded,
              });
  }
}

export default BranchService;
