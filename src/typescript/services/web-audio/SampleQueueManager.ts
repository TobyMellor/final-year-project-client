import QueuedSampleModel from '../../models/web-audio/QueuedBeat';
import { BeatBatch, QueuedSampleBatch } from '../../types/general';
import config from '../../config';
import ActionModel from '../../models/Action';
import SongTransitionModel from '../../models/SongTransition';
import * as utils from '../../utils/misc';

class SampleQueueManager {
  private static queuedSampleBatches: QueuedSampleBatch[] = [];

  public static clear() {
    this.queuedSampleBatches = [];
  }

  public static clearFuture(audioContext: AudioContext): QueuedSampleModel | null {
    const playingQueuedSample: QueuedSampleModel | null = this.getPlayingQueuedSample(audioContext);

    if (!playingQueuedSample) {
      this.clear();
      return null;
    }

    // Keep one sample, so the next sample can be queued from it
    // Leaving the action as null will not dispatch another request
    this.queuedSampleBatches = [{
      queuedSamplesToNextOriginBeat: [playingQueuedSample],
      action: null,
    }];

    return playingQueuedSample;
  }

  public static add(
    audioContext: AudioContext,
    {
      action,
      originTrackBeats,
      originTrackTransitionOutBeats,
      destinationTrackTransitionInBeats,
      destinationTrackEntryOffset,
    }: BeatBatch,
  ): QueuedSampleBatch {
    const firstSubmittedCurrentTimeInBatch = this.getNextSubmittedCurrentTime(audioContext);
    const queuedSamples: QueuedSampleModel[] = [];
    let secondsSinceFirstSampleInBatch = 0;

    // Schedule one beat per sample for beats up to the branch or transition origin
    originTrackBeats.forEach((beat) => {
      const originTrackSubmittedCurrentTime = firstSubmittedCurrentTimeInBatch + secondsSinceFirstSampleInBatch;
      const sampleDurationSecs = beat.durationSecs;

      secondsSinceFirstSampleInBatch += beat.durationSecs;

      queuedSamples.push(
        new QueuedSampleModel({
          originTrackSubmittedCurrentTime,
          originTrackBeats: [beat],
          durationSecs: sampleDurationSecs,
        }),
      );
    });

    // Schedule one long sample for Song Transitions to allow for fading and effects
    if (action instanceof SongTransitionModel) {
      const originTrackSubmittedCurrentTime = firstSubmittedCurrentTimeInBatch + secondsSinceFirstSampleInBatch;
      const destinationTrackSubmittedCurrentTime = originTrackSubmittedCurrentTime + destinationTrackEntryOffset.secs;
      const sampleDurationSecs = destinationTrackEntryOffset.secs
                               + utils.getDurationOfBeats(destinationTrackTransitionInBeats).secs;

      queuedSamples.push(
        new QueuedSampleModel({
          originTrackSubmittedCurrentTime,
          destinationTrackSubmittedCurrentTime,
          originTrackBeats: originTrackTransitionOutBeats,
          destinationTrackBeats: destinationTrackTransitionInBeats,
          durationSecs: sampleDurationSecs,
        }),
      );
    }

    this.queuedSampleBatches.push({
      action,
      queuedSamplesToNextOriginBeat: queuedSamples,
    });

    return this.last();
  }

  /**
   * Returns the last queued BeatBatch
   */
  public static last(): QueuedSampleBatch | null {
    if (this.queuedSampleBatches.length === 0) {
      return null;
    }

    return this.queuedSampleBatches[this.queuedSampleBatches.length - 1];
  }

  /**
   * Returns the last queued beat
   */
  public static lastQueuedSample(): QueuedSampleModel | null {
    const lastQueuedSample = this.last();

    if (!lastQueuedSample) {
      return null;
    }

    const { queuedSamplesToNextOriginBeat } = lastQueuedSample;
    return queuedSamplesToNextOriginBeat[queuedSamplesToNextOriginBeat.length - 1];
  }

  /**
   * Returns the next branch or transition to be taken
   */
  public static lastAction(): ActionModel | null {
    return this.last() && this.last().action;
  }

  private static getNextSubmittedCurrentTime(audioContext: AudioContext): number {
    const lastQueuedSample = this.lastQueuedSample();

    if (lastQueuedSample) {
      return lastQueuedSample.endCurrentTime;
    }

    // Add some delay to the first beat we schedule,
    // since currentTime will be in the past when the code
    // reaches source.start()
    return audioContext.currentTime + config.audio.schedulingDelaySecs;
  }

  public static getFirstBeatInSamples(samples : QueuedSampleModel[]) {
    return samples[0].originTrackBeats[0];
  }

  public static getLastBeatInSamples(samples: QueuedSampleModel[]) {
    const { originTrackBeats, destinationTrackBeats } = samples[samples.length - 1];

    if (destinationTrackBeats && destinationTrackBeats.length) {
      return destinationTrackBeats[destinationTrackBeats.length - 1];
    }

    if (originTrackBeats.length) {
      return originTrackBeats[originTrackBeats.length - 1];
    }

    // If there's no queued beats in this sample, it's an immediate transition. Try the next sample.
    const beats = samples[samples.length - 2].originTrackBeats;
    return beats[beats.length - 1];
  }

  private static getPlayingQueuedSample(audioContext: AudioContext): QueuedSampleModel {
    for (let i = this.queuedSampleBatches.length - 1; i >= 0; i -= 1) {
      const { queuedSamplesToNextOriginBeat: queuedSamples } = this.queuedSampleBatches[i];

      for (let j = queuedSamples.length - 1; j >= 0; j -= 1) {
        const queuedSample = queuedSamples[j];

        if (queuedSample.originTrackSubmittedCurrentTime <= audioContext.currentTime) {
          return queuedSamples[j];
        }
      }
    }

    return null;
  }
}

export default SampleQueueManager;
