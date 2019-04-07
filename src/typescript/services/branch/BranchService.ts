import Dispatcher from '../../events/Dispatcher';
import { FYPEvent } from '../../types/enums';
import BranchModel from '../../models/branches/Branch';
import { generateBranches } from './branches/branch-management';
import BeatModel from '../../models/audio-analysis/Beat';
import { FYPEventPayload, ForwardAndBackwardBranches, BeatBatch } from '../../types/general';

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
              .on(FYPEvent.PlayingTrackChanged, data => this.setBranches(data));

    // When the next beats are requested, identify the next branch to be taken and
    // queue the relevant beats
    Dispatcher.getInstance()
              .on(FYPEvent.NextBeatsRequested, data => this.dispatchBeatBatches(data));
  }

  public static getInstance(): BranchService {
    return this._instance || (this._instance = new this());
  }

  private async setBranches({ playingTrack, childTracks }: FYPEventPayload['PlayingTrackChanged']) {
    const [forward, backward] = this._forwardAndBackwardBranches
                              = await generateBranches(playingTrack);

    // The last forward branch cannot be taken
    forward.pop();

    Dispatcher.getInstance()
              .dispatch(FYPEvent.PlayingTrackBranchesAnalyzed, {
                playingTrack,
                childTracks,
                forwardAndBackwardBranches: [forward, backward],
              });
  }

  private async dispatchBeatBatches(
    {
      playingTrack,
      beatBatchCount,
      nextBranch,
    }: FYPEventPayload['NextBeatsRequested'],
  ) {
    const { beats } = await playingTrack.getAudioAnalysis();
    const branches = this.getBranches();
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

    // All beats between, but not including, the fromBeat and the next branch's originBeat
    const beatsBetweenFromAndOrigin = this.getBeatsBetween(allBeats,
                                                           fromBeat,
                                                           nextBranch.originBeat);
    const beatBatch: BeatBatch = {
      beatsToBranchOrigin: [fromBeat, ...beatsBetweenFromAndOrigin],
      branch: nextBranch,
    };

    Dispatcher.getInstance()
              .dispatch(FYPEvent.BeatsReadyForQueueing, {
                nextBranch,
                beatBatch,
              });

    const lastBeatInThisBatch = nextBranch.destinationBeat;
    return lastBeatInThisBatch;
  }

  private getBeatsBetween(
    allBeats: BeatModel[],
    { order: fromBeatOrder }: BeatModel,
    { order: toBeatOrder }: BeatModel,
  ): BeatModel[] {
    return allBeats.slice(fromBeatOrder + 1, toBeatOrder);
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
    return [...forward, ...backward];
  }
}

export default BranchService;
