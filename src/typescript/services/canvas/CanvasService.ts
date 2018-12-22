/**
 * Initial Canvas/WebGL Setup
 */

import Dispatcher from '../../events/Dispatcher';
import TrackModel from '../../models/audio-analysis/Track';
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

  public async setSongCircles(
    { playingTrack, childTracks }: { playingTrack: TrackModel, childTracks: TrackModel[] },
  ) {
    const parentSongCircle = await DrawableFactory.renderParentSongCircle(this.scene, playingTrack);

    childTracks.forEach((childTrack) => {
      const percentage = Math.round(Math.random() * 100);

      return DrawableFactory.renderChildSongCircle(this.scene,
                                                   parentSongCircle,
                                                   childTrack,
                                                   percentage);
    });
  }

  public getScene() {
    return this.scene;
  }
}

export default CanvasService;
