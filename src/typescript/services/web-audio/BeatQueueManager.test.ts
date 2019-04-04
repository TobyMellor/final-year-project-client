import Dispatcher from '../../events/Dispatcher';
import config from '../../config';
import WebAudioService from './WebAudioService';
import { FYPEvent } from '../../types/enums';
import { createTrack } from '../../factories/track';
import BeatQueueManager from './BeatQueueManager';
import Beat from '../../components/beat/Beat';
import BranchModel from '../../models/branches/Branch';
import BeatModel from '../../models/audio-analysis/Beat';
import ForwardBranchModel from '../../models/branches/ForwardBranch';
import BackwardBranchModel from '../../models/branches/BackwardBranch';

describe('Beat Queue Manager', () => {
  let beats: BeatModel[];
  let branches: BranchModel[];

  beforeEach(async () => {
    BeatQueueManager.clear();

    const track = await createTrack('4RVbK6cV0VqWdpCDcx3hiT');
    beats = (await track.getAudioAnalysis()).beats;

    branches = [
      new ForwardBranchModel({
        earliestBeat: beats[3],
        latestBeat: beats[50],
      }),
      new BackwardBranchModel({
        earliestBeat: beats[0],
        latestBeat: beats[53],
      }),
    ];
  });

  it('should toggle music through config.fyp.shouldPlayMusic', async () => {
    const audioContext = new AudioContext();
    const beatBatch1 = {
      beatsToBranchOrigin: [beats[0], beats[1], beats[2]],
      branch: branches[0],
    };
    const beatBatch2 = {
      beatsToBranchOrigin: [beats[50], beats[51], beats[52]],
      branch: branches[1],
    };

    // Queue the first beat batch, scheduled current time should be
    // 0 (from stubbed AudioContext) + any scheduling delay + time taking to play the 2 beats
    BeatQueueManager.add(audioContext, beatBatch1);
    let expectedLastSubmittedCurrentTime = audioContext.currentTime
                                         + config.audio.schedulingDelaySecs
                                         + beats[0].durationSecs
                                         + beats[1].durationSecs;
    let actualSubmittedCurrentTime = BeatQueueManager.lastQueuedBeat().submittedCurrentTime;
    expect(actualSubmittedCurrentTime).toBe(expectedLastSubmittedCurrentTime);

    // Queue second beat batch, should take currentTime from the last one,
    // plus the duration of last beat in previous batch
    BeatQueueManager.add(audioContext, beatBatch2);
    expectedLastSubmittedCurrentTime += beats[2].durationSecs;
    actualSubmittedCurrentTime = BeatQueueManager.last().queuedBeatsToBranchOrigin[0].submittedCurrentTime;
    expect(actualSubmittedCurrentTime).toBe(expectedLastSubmittedCurrentTime);
  });
});
