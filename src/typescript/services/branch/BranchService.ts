import Dispatcher from '../../events/Dispatcher';
import { FYPEvent, BranchType } from '../../types/enums';
import BranchModel from '../../models/branches/Branch';
import { BranchManager } from './branches/branch-management';
import BeatModel from '../../models/audio-analysis/Beat';
import { FYPEventPayload } from '../../types/general';
import * as branchFactory from '../../factories/branch';
import TrackModel from '../../models/audio-analysis/Track';
import BackwardBranchModel from '../../models/branches/BackwardBranch';

class BranchService {
  private static _instance: BranchService;

  private constructor() {
    // Once we've loaded the first songs from Spotify, perform the Audio Analysis
    Dispatcher.getInstance()
              .on(FYPEvent.TrackChangeRequested, data => this.generateBranches(data));

    // When the next beats are requested, identify the next branch to be taken and
    // queue the relevant beats
    Dispatcher.getInstance()
              .on(FYPEvent.BeatBatchRequested, data => this.dispatchBeatBatches(data));
  }

  public static getInstance(): BranchService {
    return this._instance || (this._instance = new this());
  }

  private async generateBranches({ track }: FYPEventPayload['TrackChangeRequested']) {
    const [_, backwardBranches] = await BranchManager.generate(track);

    this.dispatchBranchesAnalyzed(backwardBranches);
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

  private async dispatchBeatBatches(
    {
      track,
      beatBatchCount,
      action,
    }: FYPEventPayload['BeatBatchRequested'],
  ) {
    if (action && !(action instanceof BranchModel)) {
      return;
    }

    const { beats } = await track.getAudioAnalysis();
    const branches = BranchManager.getManager(track)
                                  .accessibleBranches;
    let fromBeat = action && action.destinationBeat || beats[0];

    for (let i = 0; i < beatBatchCount; i += 1) {
      fromBeat = this.dispatchBeatBatchReady(beats,
                                             branches,
                                             fromBeat);
    }
  }

  /**
   * Identify the next batch of beats to schedule.
   *
   * @param allBeats All beats in a track
   * @param allBranches All available branches
   * @param fromBeat The next branch to be taken must be after this beat
   */
  private dispatchBeatBatchReady(
    allBeats: BeatModel[],
    allBranches: BranchModel[],
    fromBeat: BeatModel,
  ): BeatModel {
    const futureBranches = this.getFutureBranches(allBranches, fromBeat.startMs);
    const nextBranch = this.getBestBranch(futureBranches);
    const beatBatch = branchFactory.createBeatBatch(allBeats, fromBeat, nextBranch);

    Dispatcher.getInstance()
              .dispatch(FYPEvent.BeatBatchReady, {
                nextBranch,
                beatBatch,
              });

    const lastBeatInThisBatch = nextBranch.destinationBeat;
    return lastBeatInThisBatch;
  }

  private dispatchBranchAdded(branchesAdded: BranchModel[]) {
    Dispatcher.getInstance()
              .dispatch(FYPEvent.PlayingTrackBranchAdded, {
                branchesAdded,
              });
  }

  private dispatchBranchesAnalyzed(branches: BranchModel[]) {
    Dispatcher.getInstance()
              .dispatch(FYPEvent.BranchesAnalyzed, {
                branches,
              });
  }

  private getFutureBranches(
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

  private getBestBranch(branches: BranchModel[]): BranchModel {
    const randomIndex = Math.floor(Math.random() * branches.length);
    const randomBranch = branches[randomIndex];

    return randomBranch;
  }
}

export default BranchService;
