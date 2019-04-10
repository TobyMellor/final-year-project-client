import { TransitionType } from '../types/enums';
import TrackModel from './audio-analysis/Track';
import ActionModel, { Input as ActionInput } from './Action';
import BeatModel from './audio-analysis/Beat';
import * as utils from '../utils/misc';

export type Input = {
  track: TrackModel;
  type: TransitionType;
  destinationTrack: TrackModel;
  transitionOutStartBeat: BeatModel;
  transitionOutEndBeat: BeatModel;
  transitionInStartBeat: BeatModel;
  transitionInEndBeat: BeatModel;
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

  constructor({
    type,
    track,
    destinationTrack,
    transitionOutStartBeat,
    transitionOutEndBeat,
    transitionInStartBeat,
    transitionInEndBeat,
  }: Input) {
    const [originBeat] = utils.getEarliestAndLatestBeat(transitionOutStartBeat, transitionInStartBeat);
    const [_, destinationBeat] = utils.getEarliestAndLatestBeat(transitionOutEndBeat, transitionInEndBeat);

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
  }

  public get transitionMiddleBeat() {
    if (this.transitionOutEndBeat === this.transitionInStartBeat) {
      return this.transitionOutEndBeat;
    }

    const beats = this.track.beats;
    const middleBeatOrder = Math.floor(
      Math.abs(this.transitionInStartBeat.order - this.transitionOutEndBeat.order) / 2,
    );
    const middleBeat = beats[middleBeatOrder];

    return middleBeat;
  }
}

export default SongTransitionModel;
