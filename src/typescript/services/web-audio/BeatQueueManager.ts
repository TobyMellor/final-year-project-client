import QueuedBeatModel from '../../models/web-audio/QueuedBeat';
import { BeatBatch, QueuedBeatBatch } from '../../types/general';
import BranchModel from '../../models/branches/Branch';

class BeatQueueManager {
  private static queuedBeatBatches: QueuedBeatBatch[] = [];

  public static clear() {
    this.queuedBeatBatches = [];
  }

  public static add(
    audioContext: AudioContext,
    { beatsToBranchOrigin, branch }: BeatBatch,
  ): QueuedBeatBatch {
    const lastSubmittedCurrentTime = this.getLastSubmittedCurrentTime(audioContext);
    let secondsSinceFirstBeat = 0;

    const queuedBeats = beatsToBranchOrigin.map((beat) => {
      const submittedCurrentTime = lastSubmittedCurrentTime + secondsSinceFirstBeat;
      secondsSinceFirstBeat += beat.durationSecs;

      return new QueuedBeatModel({
        beat,
        submittedCurrentTime,
      });
    });

    this.queuedBeatBatches.push({
      branch,
      beatsToBranchOrigin: queuedBeats,
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

    const { beatsToBranchOrigin } = lastBeatBatch;
    return beatsToBranchOrigin[beatsToBranchOrigin.length - 1];
  }

  /**
   * Returns the next branch to be taken
   */
  public static lastBranch(): BranchModel | null {
    return this.last() && this.last().branch;
  }

  private static getLastSubmittedCurrentTime(audioContext: AudioContext): number {
    const lastQueuedBeat = this.lastQueuedBeat();

    if (lastQueuedBeat) {
      return lastQueuedBeat.submittedCurrentTime;
    }

    // Add some delay to the first beat we schedule,
    // since currentTime will be in the past when the code
    // reaches source.start()
    const SCHEDULING_DELAY = 1;

    return audioContext.currentTime + SCHEDULING_DELAY;
  }
}

export default BeatQueueManager;
