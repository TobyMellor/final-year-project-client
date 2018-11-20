/**
 * Initial Canvas/WebGL Setup
 */

import Dispatcher from '../../events/Dispatcher';
import Track from '../../models/audio-analysis/Track';
import SongCircle from '../canvas/drawables/SongCircle';
import Scene from '../canvas/drawables/Scene';
import * as DrawableFactory from '../../factories/drawable';

class CanvasService {
  private static _instance: CanvasService = null;

  private scene: Scene = null;

  private constructor(canvas: HTMLCanvasElement) {
    const scene = this.scene = Scene.getInstance(canvas);

    // Once we've loaded the first songs from Spotify, display the song circles
    Dispatcher.getInstance()
              .on('PlayingTrackChanged', this, this.setSongCircles);

    const render = (now: number) => {
      if (Math.random() < 0.05) {
        scene.render();
      }

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

  public setSongCircles(
    { playingTrack, childTracks }: { playingTrack: Track, childTracks: Track[] },
  ) {
    const parentSongCircle = DrawableFactory.renderParentSongCircle(this.scene, playingTrack);

    DrawableFactory.renderBranches(this.scene, parentSongCircle);

    childTracks.forEach((childTrack) => {
      const percentage = Math.round(Math.random() * 100);

      return DrawableFactory.renderChildSongCircle(this.scene,
                                                   parentSongCircle,
                                                   childTrack,
                                                   percentage);
    });
  }
}

export default CanvasService;
