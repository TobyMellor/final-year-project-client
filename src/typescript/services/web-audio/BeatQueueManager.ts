import QueuedBeatModel from '../../models/web-audio/QueuedBeat';
import { BeatBatch, QueuedBeatBatch } from '../../types/general';
import BranchModel from '../../models/branches/Branch';
import config from '../../config';

class BeatQueueManager {
  private static queuedBeatBatches: QueuedBeatBatch[] = [];

  public static clear() {
    this.queuedBeatBatches = [];
  }

  public static add(
    audioContext: AudioContext,
    { beatsToBranchOrigin, branch }: BeatBatch,
  ): QueuedBeatBatch {
    let nextSubmittedCurrentTime = this.getNextSubmittedCurrentTime(audioContext);

    const queuedBeats = beatsToBranchOrigin.map((beat) => {
      const submittedCurrentTime = nextSubmittedCurrentTime;

      nextSubmittedCurrentTime += beat.durationSecs;

      return new QueuedBeatModel({
        beat,
        submittedCurrentTime,
      });
    });

    this.queuedBeatBatches.push({
      branch,
      queuedBeatsToBranchOrigin: queuedBeats,
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

    const { queuedBeatsToBranchOrigin } = lastBeatBatch;
    return queuedBeatsToBranchOrigin[queuedBeatsToBranchOrigin.length - 1];
  }

  /**
   * Returns the next branch to be taken
   */
  public static lastBranch(): BranchModel | null {
    return this.last() && this.last().branch;
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
