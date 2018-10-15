import Drawable, {
  Input as DrawableInput, TextInformation,
} from './Drawable';
import Point from './utils/Point';
import Track from '../../../models/Track';
import Circle from './utils/Circle';

class SongCircle extends Drawable {
  private static WHITE_COLOUR: Uint8Array = new Uint8Array([255, 255, 255, 255]);
  private static BLACK_COLOUR: Uint8Array = new Uint8Array([0, 0, 0, 255]);
  private static TRANSPARENT_OVERLAY: number[] = [1, 1, 1, 1]; // Colour to overlay textures with
  private static DARKEN_OVERLAY: number[] = [0.4, 0.4, 0.4, 1];

  private radius: number;
  private lineWidth: number;
  private center: Point;

  private track: Track;

  constructor(
    track: Track,
    gl: WebGLRenderingContext,
    center: Point,
    radius: number,
    lineWidth: number,
    backgroundColour?: Uint8Array,
    textureOverlayVector: number[] = SongCircle.DARKEN_OVERLAY,
  ) {
    super();

    this.track = track;
    this.center = center;
    this.radius = radius;
    this.lineWidth = lineWidth;

    // Make smaller circles (songs with a smaller durations) appear in front
    // So, give smaller circles a smaller Z
    // One trillion isn't special here, it's just making Z small
    const oneTrillion = 1000000000;
    const z = 1 - track.getDurationMs() / oneTrillion;

    const circleDrawableInput = {
      textureOverlayVector,
      vertices: new Circle(center.x, center.y, z, 0, radius).generateVertices(),
      texture: backgroundColour || track.getBestImageURL(),
      songCircle: this,
    };

    const circleEdgeDrawableInput = {
      textureOverlayVector,
      vertices: new Circle(center.x, center.y, z, radius, radius + lineWidth).generateVertices(),
      texture: SongCircle.BLACK_COLOUR,
      songCircle: this,
    };

    super.setDrawInformationBatch(gl, [
      circleDrawableInput,
      circleEdgeDrawableInput,
    ]);
  }

  public getRadius(): number {
    return this.radius;
  }

  public getLineWidth(): number {
    return this.lineWidth;
  }

  public getCenter(): Point {
    return this.center;
  }

  public getTrack(): Track {
    return this.track;
  }
}

export default SongCircle;
