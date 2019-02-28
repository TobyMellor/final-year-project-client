import Dispatcher from '../../events/Dispatcher';
import { FYPEvent } from '../../types/enums';
import BranchModel from '../../models/branches/Branch';
import { generateBranches } from './branches/branch-management';
import BeatModel from '../../models/audio-analysis/Beat';
import { FYPEventPayload, ForwardAndBackwardBranches } from '../../types/general';

/**
 * Branch Service
 *
 * Handles:
 *  - Branch generation of playing track
 *  - Managing the Seek Queue
 */

class BranchService {
  private static _instance: BranchService;

  private _forwardAndBackwardBranches: ForwardAndBackwardBranches = [[], []];

  private constructor() {
    // Once we've loaded the first songs from Spotify, perform the Audio Analysis
    Dispatcher.getInstance()
              .on(FYPEvent.PlayingTrackChanged, this, this.setBranches);

    // When the next beats are requested, identify the next branch to be taken and
    // queue the relevant beats
    Dispatcher.getInstance()
              .on(FYPEvent.NextBeatsRequested, this, this.dispatchBeatBatches);
  }

  public static getInstance(): BranchService {
    return this._instance || (this._instance = new this());
  }

  private async setBranches({ playingTrack, childTracks }: FYPEventPayload['PlayingTrackChanged']) {
    const forwardAndBackwardBranches = this._forwardAndBackwardBranches
                                     = await generateBranches(playingTrack);

    Dispatcher.getInstance()
              .dispatch(FYPEvent.PlayingTrackBranchesAnalyzed, {
                playingTrack,
                childTracks,
                forwardAndBackwardBranches,
              });
  }

  private async dispatchBeatBatches(
    {
      playingTrack,
      beatBatchCount,
      lastQueuedBeat,
    }: FYPEventPayload['NextBeatsRequested'],
  ) {
    const { beats } = await playingTrack.getAudioAnalysis();
    const branches = this.getBranches();
    let lastBeatInPreviousBatch = lastQueuedBeat ? lastQueuedBeat.beat : null;

    for (let i = 0; i < beatBatchCount; i += 1) {
      lastBeatInPreviousBatch = this.dispatchBeatBatch(beats,
                                                       branches,
                                                       lastBeatInPreviousBatch);
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
    lastBeatInPreviousBatch: BeatModel | null,
  ): BeatModel {
    const lastBeatInPreviousBatchStartMs = lastBeatInPreviousBatch
                                         ? lastBeatInPreviousBatch.startMs
                                         : 0;

    const futureBranches = this.getFutureBranches(branches, lastBeatInPreviousBatchStartMs);
    const nextBranch = this.getBestBranch(futureBranches);
    const branchOriginBeatStartMs = nextBranch.originBeat.startMs;
    const beatsToBranchOrigin = this.getBeatsBetween(beats,
                                                     lastBeatInPreviousBatchStartMs,
                                                     branchOriginBeatStartMs);
    const beatBatch = [...beatsToBranchOrigin, nextBranch.destinationBeat];

    Dispatcher.getInstance()
              .dispatch(FYPEvent.BeatsReadyForQueueing, {
                nextBranch,
                beats: beatBatch,
              });

    const lastBeatInThisBatch = nextBranch.destinationBeat;
    return lastBeatInThisBatch;
  }

  private getBeatsBetween(beats: BeatModel[], fromMs: number, toMs: number): BeatModel[] {
    return beats.filter((beat) => {
      const [beatStartMs, beatEndMs] = beat.startAndEndMs;

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

    return branches.filter(({ originBeat }) => {
      const branchStartMs = originBeat.startMs;

      return branchStartMs > beyondTimeMs;
    });
  }

  private getBestBranch(branches: BranchModel[]): BranchModel {
    const randomIndex = Math.floor(Math.random() * branches.length);
    const randomBranch = branches[randomIndex];

    return randomBranch;
  }

  private getBranches(): BranchModel[] {
    const [forward, backward] = this._forwardAndBackwardBranches;

    // The last forward branch cannot be taken
    forward.pop();

    return [...forward, ...backward];
  }
}

export default BranchService;
