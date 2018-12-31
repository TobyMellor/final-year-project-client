import Dispatcher from '../../events/Dispatcher';
import { FYPEvent } from '../../types/enums';
import BranchModel from '../../models/branches/Branch';
import TrackModel from '../../models/audio-analysis/Track';
import { generateBranches } from './branches/branch-management';
import BeatModel from '../../models/audio-analysis/Beat';

/**
 * Branch Service
 *
 * Handles:
 *  - Branch generation of playing track
 *  - Managing the Seek Queue
 */

class BranchService {
  private static _instance: BranchService;

  private branches: BranchModel[] = [];

  private constructor() {

    // Once we've loaded the first songs from Spotify, perform the Audio Analysis
    Dispatcher.getInstance()
              .on(FYPEvent.PlayingTrackChanged, this, this.setBranches);

    // Once we've loaded the first songs from Spotify, perform the Audio Analysis
    Dispatcher.getInstance()
              .on(FYPEvent.NextBeatsRequested, this, this.dispatchBeatBatches);
  }

  public static getInstance(): BranchService {
    return this._instance || (this._instance = new this());
  }

  public getBranches(): BranchModel[] {
    return this.branches;
  }

  private async setBranches(data: { playingTrack: TrackModel, childTracks: TrackModel[] }) {
    const branches = await generateBranches(data.playingTrack);

    this.branches = branches;

    Dispatcher.getInstance()
              .dispatch(FYPEvent.PlayingTrackBranchesAnalyzed, data);
  }

  private async dispatchBeatBatches(
    {
      playingTrack,
      beatBatchCount,
      lastQueuedBeat,
    }: {
      playingTrack: TrackModel,
      beatBatchCount: number,
      lastQueuedBeat: BeatModel | null,
    },
  ) {
    const audioAnalysis = await playingTrack.getAudioAnalysis();
    const beats = audioAnalysis.getBeats();
    const branches = this.getBranches();
    let lastQueuedBeatInPreviousBatch = lastQueuedBeat;

    for (let i = 0; i < beatBatchCount; i += 1) {
      lastQueuedBeatInPreviousBatch = this.dispatchBeatBatch(beats,
                                                             branches,
                                                             lastQueuedBeatInPreviousBatch);
    }
  }

  /**
   * Identify the next batch of beats to schedule.
   *
   * @param beats All beats in a track
   * @param lastQueuedBeatInPreviousBatch The previously scheduled beat
   */
  private dispatchBeatBatch(
    beats: BeatModel[],
    branches: BranchModel[],
    lastQueuedBeatInPreviousBatch: BeatModel | null,
  ): BeatModel {
    const lastQueuedBeatInPreviousBatchStartMs = lastQueuedBeatInPreviousBatch
                                               ? lastQueuedBeatInPreviousBatch.getStartMs()
                                               : 0;

    const futureBranches = this.getFutureBranches(branches, lastQueuedBeatInPreviousBatchStartMs);
    const bestBranch = this.getBestBranch(futureBranches);
    const branchOriginBeatStartMs = bestBranch.getOriginBeat().getStartMs();
    const beatsToBranchOrigin = this.getBeatsBetween(beats,
                                                     lastQueuedBeatInPreviousBatchStartMs,
                                                     branchOriginBeatStartMs);
    const branchDestinationBeat = bestBranch.getDestinationBeat();
    const beatBatch = [...beatsToBranchOrigin, branchDestinationBeat];

    Dispatcher.getInstance()
              .dispatch(FYPEvent.BeatsReadyForQueueing, {
                beats: beatBatch,
              });

    const lastQueuedBeatInThisBatch = branchDestinationBeat;
    return lastQueuedBeatInThisBatch;
  }

  private getBeatsBetween(beats: BeatModel[], fromMs: number, toMs: number): BeatModel[] {
    return beats.filter((beat) => {
      const beatStartMs = beat.getStartMs();
      const beatEndMs = beatStartMs + beat.getDurationMs();

      // Don't include the lastQueuedBeatInPreviousBatch, and don't include
      // the Branch's Origin Beat either
      return fromMs < beatStartMs && beatEndMs < toMs;
    });
  }

  private getFutureBranches(
    branches: BranchModel[],
    beyondTimeMs: number,
  ): BranchModel[] {
    if (beyondTimeMs === 0) {
      return branches;
    }

    return branches.filter((branch) => {
      const branchStartMs = branch.getOriginBeat().getStartMs();

      return branchStartMs > beyondTimeMs;
    });
  }

  private getBestBranch(branches: BranchModel[]): BranchModel {
    const randomBranch = branches[Math.floor(Math.random() * branches.length)];

    return randomBranch;
  }
}

export default BranchService;
