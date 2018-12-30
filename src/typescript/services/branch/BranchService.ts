import Dispatcher from '../../events/Dispatcher';
import { FYPEvent } from '../../types/enums';
import BranchModel from '../../models/branches/Branch';
import TrackModel from '../../models/audio-analysis/Track';
import { generateBranches } from './branches/branch-management';

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
}

export default BranchService;
