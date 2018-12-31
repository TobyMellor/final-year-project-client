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
    { playingTrack, beatBatchCount }: { playingTrack: TrackModel, beatBatchCount: number },
  ) {
    const audioAnalysis = await playingTrack.getAudioAnalysis();
    const beats = audioAnalysis.getBeats();

    for (let i = 0; i < beatBatchCount; i += 1) {
      this.dispatchNextBeats(beats);
    }
  }

  private dispatchNextBeats(beats: BeatModel[]) {
    const nextBeats = beats.splice(0, Math.round(beats.length / 10));

    Dispatcher.getInstance()
              .dispatch(FYPEvent.BeatsReadyForQueueing, {
                beats: nextBeats,
              });
  }
}

export default BranchService;
