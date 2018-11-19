/**
 * Initial Canvas/WebGL Setup
 */

import Dispatcher from '../../events/Dispatcher';
import Track from '../../models/Track';
import SongCircle, { Drawable } from '../canvas/drawables/SongCircle';
import Scene from '../canvas/drawables/Scene';
import * as DrawableFactory from './drawables/drawable-factory';

class CanvasService {
  private static _instance: CanvasService = null;

  private drawables: Drawable[] = [];

  private parentSongCircle: SongCircle = null;
  private childSongCircles: SongCircle[] = [];

  private constructor(canvas: HTMLCanvasElement) {
    // Once we've loaded the first songs from Spotify, display the song circles
    Dispatcher.getInstance()
              .on('PlayingTrackChanged', this, this.setSongCircles);

    const render = (now: number) => {
      if (Math.random() < 0.05) {
        Scene.getInstance(canvas)
             .add(...this.drawables)
             .render();
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

  public getParentSongCircle(): SongCircle {
    return this.parentSongCircle;
  }

  public setSongCircles(
    { playingTrack, childTracks }: { playingTrack: Track, childTracks: Track[] },
  ) {
    const parentSongCircle = DrawableFactory.createParentSongCircle(playingTrack);
    const childSongCircles = childTracks.map((childTrack) => {
      const percentage = Math.round(Math.random() * 100);

      return DrawableFactory.createChildSongCircle(parentSongCircle, childTrack, percentage);
    });
    const allSongCircles = [parentSongCircle, ...childSongCircles];
    const drawables: Drawable[] = [];

    allSongCircles.forEach((songCircle) => {
      drawables.push(songCircle.getDrawable());
    });

    this.parentSongCircle = parentSongCircle;
    this.childSongCircles = childSongCircles;
    this.drawables = drawables;
  }
}

export default CanvasService;
