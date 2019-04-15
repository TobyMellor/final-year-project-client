import Dispatcher from '../../events/Dispatcher';
import config from '../../config';
import WebAudioService from './WebAudioService';
import { FYPEvent } from '../../types/enums';
import { createTrack } from '../../factories/track';
import BeatQueueManager from './SampleQueueManager';
import Beat from '../../components/beat/Beat';
import BranchModel from '../../models/branches/Branch';
import BeatModel from '../../models/audio-analysis/Beat';
import ForwardBranchModel from '../../models/branches/ForwardBranch';
import BackwardBranchModel from '../../models/branches/BackwardBranch';
import TrackModel from '../../models/audio-analysis/Track';

describe('Sample Queue Manager', () => {
  let track: TrackModel;
  let beats: BeatModel[];
  let branches: BranchModel[];

  beforeEach(async () => {
    BeatQueueManager.clear();

    track = await createTrack('4RVbK6cV0VqWdpCDcx3hiT');
    beats = track.beats;

    branches = [
      new ForwardBranchModel({
        track,
        earliestBeat: beats[3],
        latestBeat: beats[50],
      }),
      new BackwardBranchModel({
        track,
        earliestBeat: beats[0],
        latestBeat: beats[53],
      }),
    ];
  });

  it.skip('can add beat batches to the BeatQueueManager', async () => {
    // const audioContext = new AudioContext();
    // const beatBatch1 = {
    //   track,
    //   beatsToOriginBeat: [beats[0], beats[1], beats[2]],
    //   action: branches[0],
    // };
    // const beatBatch2 = {
    //   track,
    //   beatsToOriginBeat: [beats[50], beats[51], beats[52]],
    //   action: branches[1],
    // };

    // // Queue the first beat batch, scheduled current time should be
    // // 0 (from stubbed AudioContext) + any scheduling delay + time taking to play the 2 beats
    // BeatQueueManager.add(audioContext, beatBatch1);
    // let expectedLastSubmittedCurrentTime = audioContext.currentTime
    //                                      + config.audio.schedulingDelaySecs
    //                                      + beats[0].durationSecs
    //                                      + beats[1].durationSecs;
    // let actualSubmittedCurrentTime = BeatQueueManager.lastQueuedBeat().submittedCurrentTime;
    // expect(actualSubmittedCurrentTime).toBe(expectedLastSubmittedCurrentTime);

    // // Queue second beat batch, should take currentTime from the last one,
    // // plus the duration of last beat in previous batch
    // BeatQueueManager.add(audioContext, beatBatch2);
    // expectedLastSubmittedCurrentTime += beats[2].durationSecs;
    // actualSubmittedCurrentTime = BeatQueueManager.last().queuedBeatsToOriginBeat[0].submittedCurrentTime;
    // expect(actualSubmittedCurrentTime).toBe(expectedLastSubmittedCurrentTime);
  });
});
