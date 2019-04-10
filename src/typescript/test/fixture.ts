import TrackModel from '../models/audio-analysis/Track';
import { getATrackMock } from '../services/api/mocks/spotify/tracks';
import AudioAnalysisModel from '../models/audio-analysis/AudioAnalysis';
import { ForwardAndBackwardBranches } from '../types/general';
import Dispatcher from '../events/Dispatcher';
import { FYPEvent } from '../types/enums';
import * as branchFactory from '../factories/branch';

export function track(options: AddTrackOptions = {}): TrackModel {
  const trackMock = getATrackMock('4RVbK6cV0VqWdpCDcx3hiT');

  return new TrackModel({ ...trackMock, ...options });
}

/**
 * Generates a desired number of branches from an audio analysis
 *
 * @param audioAnalysis An AudioAnalysis containing beats
 * @param quantity The desired quantity of (forward) branches
 */
export function forwardAndBackwardBranches(
  track: TrackModel,
  quantity: number,
): ForwardAndBackwardBranches {
  const beats = track.beats;

  if (quantity > beats.length / 2) {
    throw new Error('Not enough beats for desired quantity');
  }

  const [forwardBranches, backwardBranches]: ForwardAndBackwardBranches = [[], []];

  for (let i = 0; i < quantity * 2; i += 2) {
    const [forwardBranch, backwardBranch] = branchFactory.createForwardAndBackwardBranch(
      track,
      beats[i],
      beats[i + 1],
    );

    forwardBranches.push(forwardBranch);
    backwardBranches.push(backwardBranch);
  }

  return [forwardBranches, backwardBranches];
}

export function dispatchTrackChanged() {
  const playingTrack = track();

  Dispatcher.getInstance()
            .dispatch(FYPEvent.TrackChanged, {
              track: playingTrack,
            });
}

export function dispatchPlayingTrackBranchAdded(branchCount: number) {
  const playingTrack = track();
  const [_, backwardBranches] = forwardAndBackwardBranches(playingTrack, branchCount);

  Dispatcher.getInstance()
            .dispatch(FYPEvent.PlayingTrackBranchAdded, {
              branchesAdded: backwardBranches,
            });
}

export function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
