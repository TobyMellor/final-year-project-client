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

  public static add(
    audioContext: AudioContext,
    { action, originTrackBeats, destinationTrackBeats, destinationTrackEntry }: BeatBatch,
  ): QueuedSampleBatch {
    const firstSubmittedCurrentTimeInBatch = this.getNextSubmittedCurrentTime(audioContext);
    const queuedSamples: QueuedSampleModel[] = [];

    // Schedule one long sample for Song Transitions to allow for fading and effects
    // Schedule one sample per beat for normal branches to allow for more granular control
    if (action instanceof SongTransitionModel) {
      const originTrackSubmittedCurrentTime = firstSubmittedCurrentTimeInBatch;
      const destinationTrackSubmittedCurrentTime = originTrackSubmittedCurrentTime + destinationTrackEntry.secs;
      const sampleDurationSecs = destinationTrackEntry.secs + utils.getDurationOfBeats(destinationTrackBeats).secs;

      queuedSamples.push(
        new QueuedSampleModel({
          originTrackBeats,
          destinationTrackBeats,
          originTrackSubmittedCurrentTime,
          destinationTrackSubmittedCurrentTime,
          durationSecs: sampleDurationSecs,
        }),
      );
    } else {
      let secondsSinceFirstSampleInBatch = 0;

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

    if (destinationTrackBeats) {
      return destinationTrackBeats[destinationTrackBeats.length - 1];
    }

    return originTrackBeats[originTrackBeats.length - 1];
  }
}

export default SampleQueueManager;
