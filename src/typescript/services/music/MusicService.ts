import * as drawableFactory from '../canvas/drawables/drawable-factory';
import DrawableBuilder from '../canvas/drawables/utils/DrawableBuilder';
import { DrawInformation } from '../canvas/drawables/Drawable';
import CanvasService from '../canvas/CanvasService';

/**
 * Initial Music Setup
 */

class MusicService {
  private static _instance: MusicService;

  public static getInstance(): MusicService {
    return this._instance || (this._instance = new this());
  }

  private constructor() {
    // AJAX requests for spotify data
    // Analyse beats and bars
    // Render the circles in the correct places

    const parentSongCircle = drawableFactory.createParentSongCircle(10, 1);
    const childSongCircle1 = drawableFactory.createChildSongCircle(parentSongCircle,
                                                                   25,
                                                                   8,
                                                                   0.7);
    const childSongCircle2 = drawableFactory.createChildSongCircle(parentSongCircle,
                                                                  67,
                                                                  3,
                                                                  0.3);

    // Build the objects we need to draw
    const drawableBuilder: DrawableBuilder = new DrawableBuilder()
      .add(parentSongCircle.getDrawInformationBatch())
      .add(childSongCircle1.getDrawInformationBatch())
      .add(childSongCircle2.getDrawInformationBatch());

    CanvasService.getInstance()
                 .setDrawInformationBatch(drawableBuilder);
  }
}

export default MusicService;
