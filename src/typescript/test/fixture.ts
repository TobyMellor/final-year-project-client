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

export async function trackAudioAnalysis(): Promise<AudioAnalysisModel> {
  return track().getAudioAnalysis();
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

export async function dispatchPlayingTrackBranchesAnalyzed(branchQuantity: number = 2) {
  const playingTrack = track();
  const audioAnalysis = await playingTrack.getAudioAnalysis();
  const branches = forwardAndBackwardBranches(audioAnalysis, branchQuantity);

  Dispatcher.getInstance()
            .dispatch(FYPEvent.PlayingTrackBranchesAnalyzed, {
              playingTrack,
              forwardAndBackwardBranches: branches,
              childTracks: [],
            });
}

/**
 * Listens to FYPEvent.PlayingTrackRendered, and returns
 * the callback to be executed when the event is fired.
 *
 * Use this jest.fn() callback to assert it is called when expected.
 */
export function listenPlayingTrackRendered(): () => void {
  const callbackFn = jest.fn();

  Dispatcher.getInstance()
            .on(FYPEvent.PlayingTrackRendered, this, callbackFn);

  return callbackFn;
}

export function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
