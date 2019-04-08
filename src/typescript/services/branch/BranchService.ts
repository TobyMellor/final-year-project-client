import Dispatcher from '../../events/Dispatcher';
import { FYPEvent, BranchType } from '../../types/enums';
import BranchModel from '../../models/branches/Branch';
import { BranchManager } from './branches/branch-management';
import BeatModel from '../../models/audio-analysis/Beat';
import { FYPEventPayload } from '../../types/general';
import * as branchFactory from '../../factories/branch';
import TrackModel from '../../models/audio-analysis/Track';
import { SimilarBeatPair } from './branches/branch-analysis';
import ForwardBranchModel from '../../models/branches/ForwardBranch';
import BackwardBranchModel from '../../models/branches/BackwardBranch';

/**
 * Branch Service
 *
 * Handles:
 *  - Branch generation of playing track
 *  - Managing the Seek Queue
 */

class BranchService {
  private static _instance: BranchService;

  private constructor() {
    // Once we've loaded the first songs from Spotify, perform the Audio Analysis
    Dispatcher.getInstance()
              .on(FYPEvent.PlayingTrackChanged, data => this.setBranches(data));

    // When the next beats are requested, identify the next branch to be taken and
    // queue the relevant beats
    Dispatcher.getInstance()
              .on(FYPEvent.NextBeatsRequested, data => this.dispatchBeatBatches(data));
  }

  public static getInstance(): BranchService {
    return this._instance || (this._instance = new this());
  }

  public createBranch(firstBeat: BeatModel, secondBeat: BeatModel) {
    const [earliestBeat, latestBeat] = firstBeat.order < secondBeat.order
                                     ? [firstBeat, secondBeat]
                                     : [secondBeat, firstBeat];
    BranchManager.createBranches([earliestBeat, latestBeat]);

    this.dispatchBranchAdded([
      new BackwardBranchModel({
        earliestBeat,
        latestBeat,
      }),
    ]);
  }

  private async setBranches({ playingTrack, childTracks }: FYPEventPayload['PlayingTrackChanged']) {
    const [_, backwardBranches] = await BranchManager.generate(playingTrack);
    this.dispatchBranchAdded(backwardBranches, playingTrack, childTracks);
  }

  private async dispatchBeatBatches(
    {
      playingTrack,
      beatBatchCount,
      nextBranch,
    }: FYPEventPayload['NextBeatsRequested'],
  ) {
    const { beats } = await playingTrack.getAudioAnalysis();
    const branches = BranchManager.getBranches();
    let fromBeat = nextBranch && nextBranch.destinationBeat || beats[0];

    for (let i = 0; i < beatBatchCount; i += 1) {
      fromBeat = this.dispatchBeatBatch(beats,
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
  private dispatchBeatBatch(
    allBeats: BeatModel[],
    allBranches: BranchModel[],
    fromBeat: BeatModel,
  ): BeatModel {
    const futureBranches = this.getFutureBranches(allBranches, fromBeat.startMs);
    const nextBranch = this.getBestBranch(futureBranches);
    const beatBatch = branchFactory.createBeatBatch(allBeats, fromBeat, nextBranch);

    Dispatcher.getInstance()
              .dispatch(FYPEvent.BeatsReadyForQueueing, {
                nextBranch,
                beatBatch,
              });

    const lastBeatInThisBatch = nextBranch.destinationBeat;
    return lastBeatInThisBatch;
  }

  private dispatchBranchAdded(
    branchesAdded: BranchModel[],
    playingTrack: TrackModel = null,
    childTracks: TrackModel[] = null,
  ) {
    Dispatcher.getInstance()
              .dispatch(FYPEvent.PlayingTrackBranchAdded, {
                branchesAdded,
                playingTrack,
                childTracks,
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
