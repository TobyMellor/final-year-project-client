import Drawable, {
  Input as DrawableInput,
} from './Drawable';
import Point from './utils/Point';
import Track from '../../../models/Track';

class SongCircle extends Drawable {
  private static RESOLUTION: number = 1;      // A lower number gives a higher resolution
  private static START_DEGREES: number = 0.0; // Where in the circle we should start drawing from
  private static END_DEGREES: number = 360.0; // Where in the circle we should stop drawing to

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
    textureOverlayVector?: number[],
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

    // Parametric Equation of a circle:
    //   x = r cos(t)
    //   y = r cos(t)
    // Where r is the radius of the circle, and t is some angle
    const circleDrawInformationInput1: DrawableInput = this.getCircleDrawInformationInput(
      (_: number) => [
        center.x,
        center.y,
        z,
      ],
      (radians: number) => [
        radius * Math.sin(radians) + center.x,
        radius * Math.cos(radians) + center.y,
        z,
      ],
      backgroundColour || track.getBestImageURL(),
      textureOverlayVector,
    );
    const circleDrawInformationInput2: DrawableInput = this.getCircleDrawInformationInput(
      (radians: number) => [
        radius * Math.sin(radians) + center.x,
        radius * Math.cos(radians) + center.y,
        z,
      ],
      (radians: number) => [
        (radius + lineWidth) * Math.sin(radians) + center.x,
        (radius + lineWidth) * Math.cos(radians) + center.y,
        z,
      ],
      SongCircle.BLACK_COLOUR,
      textureOverlayVector,
    );

    super.setDrawInformationBatch(gl, [
      circleDrawInformationInput1,
      circleDrawInformationInput2,
    ]);
  }

  private getCircleDrawInformationInput(
    insideVertexFn: (radians: number) => number[],  // The inner vertex (closest to the center)
    outsideVertexFn: (radians: number) => number[], // The outer vertex (furthest from the center)
    texture?: string | Uint8Array,
    textureOverlayVector?: number[],
  ): DrawableInput {
    const vertices: number[] = [];

    for (
      let degrees = SongCircle.START_DEGREES;
      degrees <= SongCircle.END_DEGREES;
      degrees += SongCircle.RESOLUTION
    ) {
      const radians = Drawable.convert(degrees, Drawable.degreesToRadiansFn); // Degrees to radians

      const insideVertex: number[] = insideVertexFn(radians);
      const outsideVertex: number[] = outsideVertexFn(radians);

      vertices.push(...insideVertex, ...outsideVertex);
    }

    return {
      vertices,
      texture,
      textureOverlay: textureOverlayVector || SongCircle.DARKEN_OVERLAY,
      songCircle: this,
    };
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
