import { TransitionType } from '../types/enums';
import TrackModel from './audio-analysis/Track';
import ActionModel, { Input as ActionInput } from './Action';
import BeatModel from './audio-analysis/Beat';
import * as conversions from '../utils/conversions';
import { TimeIdentifier } from '../types/general';

export type Input = {
  track: TrackModel;
  type: TransitionType;
  destinationTrack: TrackModel;
  transitionOutStartBeat: BeatModel;
  transitionOutEndBeat: BeatModel;
  transitionInStartBeat: BeatModel;
  transitionInEndBeat: BeatModel;
  transitionInEntryOffsetMs: number,
};

/**
 * A SongTransition represents a smooth transition from one song to another.
 * Some terminology taht is important:
 *    - transitionOutStartBeat: Where the playing track begins to transition out
 *    - transitionOutEndBeat: Where the playing track has stopped playing
 *    - transitionInStartBeat: Where the next track begins to transition in
 *    - transitionInEndBeat: Where the next track has fully transitioned in
 *
 * The originBeat will be either the transitionOutStartBeat or the transitionInStartBeat, whichever is earliest.
 * The destinationBeat will be either the transitionOutEndBeat or the transitionInEndBeat, whichever is latest.
 */
class SongTransitionModel extends ActionModel {
  public type: TransitionType;
  public destinationTrack: TrackModel;
  public transitionOutStartBeat: BeatModel;
  public transitionOutEndBeat: BeatModel;
  public transitionInStartBeat: BeatModel;
  public transitionInEndBeat: BeatModel;
  public transitionInEntryOffset: TimeIdentifier;

  constructor({
    type,
    track,
    destinationTrack,
    transitionOutStartBeat,
    transitionOutEndBeat,
    transitionInStartBeat,
    transitionInEndBeat,
    transitionInEntryOffsetMs,
  }: Input) {
    // const [originBeat] = utils.getEarliestAndLatestBeat(transitionOutStartBeat, transitionInStartBeat);
    // const [_, destinationBeat] = utils.getEarliestAndLatestBeat(transitionOutEndBeat, transitionInEndBeat);
    const originBeat = transitionOutStartBeat;
    const destinationBeat = transitionInEndBeat;

    super({
      track,
      originBeat,
      destinationBeat,
    });

    if (track.ID === destinationTrack.ID) {
      throw new Error('The originTrack and destinationTrack must be different!');
    }

    this.type = type;
    this.destinationTrack = destinationTrack;
    this.transitionOutStartBeat = transitionOutStartBeat;
    this.transitionOutEndBeat = transitionOutEndBeat;
    this.transitionInStartBeat = transitionInStartBeat;
    this.transitionInEndBeat = transitionInEndBeat;
    this.transitionInEntryOffset = conversions.getTimeIdentifierFromMs(transitionInEntryOffsetMs);
  }

  public get transitionOutMiddleBeat() {
    const beats = this.track.beats;
    const middleBeatOrder = this.transitionOutStartBeat.order + Math.floor(
      Math.abs(this.transitionOutStartBeat.order - this.transitionOutEndBeat.order) / 2,
    );
    const middleBeat = beats[middleBeatOrder];

    return middleBeat;
  }
}

export default SongTransitionModel;
