/**
 * Canvas Service
 *
 * Handles everything to do with the canvas,
 * including animations, WebGL, circles,
 * branches, etc.
 */

import Dispatcher from '../../events/Dispatcher';
import TrackModel from '../../models/audio-analysis/Track';
import Scene from '../canvas/drawables/Scene';
import * as drawableFactory from '../../factories/drawable';
import * as conversions from './drawables/utils/conversions';
import { FYPEvent } from '../../types/enums';

class CanvasService {
  private static _instance: CanvasService = null;

  public scene: Scene = null;

  private constructor(canvas: HTMLCanvasElement) {
    const scene = this.scene = Scene.getInstance(canvas);

    // Once we've loaded and analyzed the playing track, display the song circles
    Dispatcher.getInstance()
              .on(FYPEvent.PlayingTrackBranchesAnalyzed, this, this.setSongCircles);

    const render = (nowMs: number) => {
      const nowSecs = conversions.millisecondsToSeconds(nowMs);

      scene.render(nowSecs);

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  }

  public static getInstance(canvas?: HTMLCanvasElement): CanvasService {
    if (this._instance) {
      return this._instance;
    }

    return this._instance = new this(canvas);
  }

  public async setSongCircles(
    { playingTrack, childTracks }: { playingTrack: TrackModel, childTracks: TrackModel[] },
  ) {
    const parentSongCircle = await drawableFactory.renderParentSongCircle(this.scene, playingTrack);

    childTracks.forEach((childTrack) => {
      const percentage = conversions.getRandomInteger();

      return drawableFactory.renderChildSongCircle(this.scene,
                                                   parentSongCircle,
                                                   childTrack,
                                                   percentage);
    });

    Dispatcher.getInstance()
              .dispatch(FYPEvent.PlayingTrackRendered);
  }
}

export default CanvasService;
