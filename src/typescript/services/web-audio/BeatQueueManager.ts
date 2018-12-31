import QueuedBeatModel from '../../models/web-audio/QueuedBeat';
import BeatModel from '../../models/audio-analysis/Beat';

class BeatQueueManager {
  private static queuedBeats: QueuedBeatModel[] = [];

  public static clear() {
    this.queuedBeats = [];
  }

  public static add(audioContext: AudioContext, beats: BeatModel[]): QueuedBeatModel[] {
    const lastSubmittedCurrentTime = this.getLastSubmittedCurrentTime(audioContext);
    const lastBeatStartSecs = this.getLastBeatStartSecs();

    const queuedBeats = beats.map((beat) => {
      const thisBeatStartSecs = beat.getStart().secs;
      const secondsSinceFirstBeat = thisBeatStartSecs - lastBeatStartSecs;
      const submittedCurrentTime = lastSubmittedCurrentTime + secondsSinceFirstBeat;

      return new QueuedBeatModel({
        beat,
        submittedCurrentTime,
      });
    });

    this.queuedBeats.push(...queuedBeats);

    return queuedBeats;
  }

  private static last(): QueuedBeatModel {
    return this.queuedBeats[this.queuedBeats.length - 1];
  }

  private static getLastSubmittedCurrentTime(audioContext: AudioContext): number {
    if (this.queuedBeats.length) {
      return this.last().getSubmittedCurrentTime();
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
                 .getBeat()
                 .getStart()
                 .secs;
    }

    return 0;
  }

  public static getQueuedBeats(): QueuedBeatModel[] {
    return this.queuedBeats;
  }
}

export default BeatQueueManager;
