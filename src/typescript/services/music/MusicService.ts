import CanvasService from '../canvas/CanvasService';
import Track from '../../models/Track';
import { GetAnAlbum } from '../api/spotify/albums';
import { GetAnArtist } from '../api/spotify/artists';
import { GetATrack } from '../api/spotify/tracks';

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

    GetATrack.request(1).then(console.log);

    // const canvasService = CanvasService.getInstance();

    // canvasService.setParentSongCircle(track);

    // const parentSongCircle = drawableFactory.createParentSongCircle();
    // const childSongCircle1 = drawableFactory.createChildSongCircle(parentSongCircle,
    //                                                                25,
    //                                                                8,
    //                                                                0.7);
    // const childSongCircle2 = drawableFactory.createChildSongCircle(parentSongCircle,
    //                                                               67,
    //                                                               3,
    //                                                               0.3);

    // // Build the objects we need to draw
    // const drawableBuilder: DrawableBuilder = new DrawableBuilder()
    //   .add(parentSongCircle.getDrawInformationBatch())
    //   .add(childSongCircle1.getDrawInformationBatch())
    //   .add(childSongCircle2.getDrawInformationBatch());

    // CanvasService.getInstance()
    //              .setDrawInformationBatch(drawableBuilder);
  }
}

export default MusicService;
