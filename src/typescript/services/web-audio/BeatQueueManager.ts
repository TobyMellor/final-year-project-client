import QueuedBeatModel from '../../models/web-audio/QueuedBeat';
import BeatModel from '../../models/audio-analysis/Beat';

class BeatQueueManager {
  private static queuedBeats: QueuedBeatModel[] = [];

  public static clear() {
    this.queuedBeats = [];
  }

  public static add(audioContext: AudioContext, beats: BeatModel[]): QueuedBeatModel[] {
    const lastSubmittedCurrentTime = this.getLastSubmittedCurrentTime(audioContext);
    let secondsSinceFirstBeat = 0;

    const queuedBeats = beats.map((beat) => {
      const submittedCurrentTime = lastSubmittedCurrentTime + secondsSinceFirstBeat;
      secondsSinceFirstBeat += beat.durationSecs;

      return new QueuedBeatModel({
        beat,
        submittedCurrentTime,
      });
    });

    this.queuedBeats.push(...queuedBeats);

    return queuedBeats;
  }

  /**
   * Removes all of the beats in the queue until a certain beat
   *
   * @param queuedBeat The beat marking the end of the removals
   */
  public static removeUntil(queuedBeat: QueuedBeatModel) {
    while (this.queuedBeats.length > 0 && queuedBeat.equals(this.queuedBeats[0])) {
      this.queuedBeats.shift();
    }
  }

  /**
   * Returns the first queued beat in the queue
   */
  public static first(): QueuedBeatModel {
    return this.queuedBeats[0];
  }

  /**
   * Returns the last queued beat in the queue
   */
  public static last(): QueuedBeatModel {
    return this.queuedBeats[this.queuedBeats.length - 1];
  }

  /**
   * The last beat that's queued will always be a single destination beat of a branch.
   * Before that beat will be the origin beat of a branch.
   */
  public static lastInBeatBatch(): QueuedBeatModel {
    return this.queuedBeats[this.queuedBeats.length - 2];
  }

  private static getLastSubmittedCurrentTime(audioContext: AudioContext): number {
    if (this.queuedBeats.length) {
      return this.last().submittedCurrentTime;
    }

    // Add some delay to the first beat we schedule,
    // since currentTime will be in the past when the code
    // reaches source.start()
    const SCHEDULING_DELAY = 1;

    return audioContext.currentTime + SCHEDULING_DELAY;
  }

  private static getLastBeatStartSecs(): number {
    if (this.queuedBeats.length) {
      return this.last()
                 .beat
                 .startSecs;
    }

    return 0;
  }

  public static getQueuedBeats(): QueuedBeatModel[] {
    return this.queuedBeats;
  }
}

export default BeatQueueManager;
