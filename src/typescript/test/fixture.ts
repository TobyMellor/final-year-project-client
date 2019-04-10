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
  { beats }: AudioAnalysisModel,
  quantity: number,
): ForwardAndBackwardBranches {
  if (quantity > beats.length / 2) {
    throw new Error('Not enough beats for desired quantity');
  }

  const [forwardBranches, backwardBranches]: ForwardAndBackwardBranches = [[], []];

  for (let i = 0; i < quantity * 2; i += 2) {
    const [forwardBranch, backwardBranch] = branchFactory.createForwardAndBackwardBranch(
      beats[i],
      beats[i + 1],
    );

    forwardBranches.push(forwardBranch);
    backwardBranches.push(backwardBranch);
  }

  return [forwardBranches, backwardBranches];
}

export function dispatchPlayingTrackChanged() {
  const playingTrack = track();

  Dispatcher.getInstance()
            .dispatch(FYPEvent.TrackChanged, {
              playingTrack,
            });
}

export function dispatchPlayingTrackBranchAdded(branchCount: number) {
  const playingTrack = track();
  const audioAnalysis = playingTrack.audioAnalysis;
  const [_, backwardBranches] = forwardAndBackwardBranches(audioAnalysis, branchCount);

  Dispatcher.getInstance()
            .dispatch(FYPEvent.PlayingTrackBranchAdded, {
              branchesAdded: backwardBranches,
            });
}

export function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
