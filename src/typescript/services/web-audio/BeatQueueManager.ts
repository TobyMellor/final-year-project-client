import QueuedBeatModel from '../../models/web-audio/QueuedBeat';
import { BeatBatch, QueuedBeatBatch } from '../../types/general';
import config from '../../config';
import ActionModel from '../../models/Action';

class BeatQueueManager {
  private static queuedBeatBatches: QueuedBeatBatch[] = [];

  public static clear() {
    this.queuedBeatBatches = [];
  }

  public static add(
    audioContext: AudioContext,
    { beatsToOriginBeat, action }: BeatBatch,
  ): QueuedBeatBatch {
    const firstSubmittedCurrentTimeInBatch = this.getNextSubmittedCurrentTime(audioContext);
    let secondsSinceFirstBeatInBatch = 0;

    const queuedBeats = beatsToOriginBeat.map((beat) => {
      const submittedCurrentTime = firstSubmittedCurrentTimeInBatch + secondsSinceFirstBeatInBatch;

      secondsSinceFirstBeatInBatch += beat.durationSecs;

      return new QueuedBeatModel({
        beat,
        submittedCurrentTime,
      });
    });

    this.queuedBeatBatches.push({
      action,
      queuedBeatsToOriginBeat: queuedBeats,
    });

    return this.last();
  }

  /**
   * Returns the last queued BeatBatch
   */
  public static last(): QueuedBeatBatch | null {
    if (this.queuedBeatBatches.length === 0) {
      return null;
    }

    return this.queuedBeatBatches[this.queuedBeatBatches.length - 1];
  }

  /**
   * Returns the last queued beat
   */
  public static lastQueuedBeat(): QueuedBeatModel | null {
    const lastBeatBatch = this.last();

    if (!lastBeatBatch) {
      return null;
    }

    const { queuedBeatsToOriginBeat } = lastBeatBatch;
    return queuedBeatsToOriginBeat[queuedBeatsToOriginBeat.length - 1];
  }

  /**
   * Returns the next branch or transition to be taken
   */
  public static lastAction(): ActionModel | null {
    return this.last() && this.last().action;
  }

  private static getNextSubmittedCurrentTime(audioContext: AudioContext): number {
    const lastQueuedBeat = this.lastQueuedBeat();

    if (lastQueuedBeat) {
      return lastQueuedBeat.submittedCurrentTime + lastQueuedBeat.beat.durationSecs;
    }

    // Add some delay to the first beat we schedule,
    // since currentTime will be in the past when the code
    // reaches source.start()
    return audioContext.currentTime + config.audio.schedulingDelaySecs;
  }
}

export default BeatQueueManager;
