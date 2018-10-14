import Drawable, {
  Input as DrawableInput,
} from './Drawable';
import Point from './utils/Point';
import Track from '../../../models/Track';

class SongCircle extends Drawable {
  private RESOLUTION: number = 1;      // A lower number gives a higher resolution
  private START_DEGREES: number = 0.0; // Where in the circle we should start drawing from
  private END_DEGREES: number = 360.0; // Where in the circle we should stop drawing to

  private radius: number;
  private lineWidth: number;
  private center: Point;

  private track: Track;

  constructor(
    track: Track,
    gl: WebGLRenderingContext,
    center: Point,
    radius: number,
    lineWidth: number = 1,
  ) {
    super();

    this.track = track;
    this.center = center;
    this.radius = radius;
    this.lineWidth = lineWidth;

    // Parametric Equation of a circle:
    //   x = r cos(t)
    //   y = r cos(t)
    // Where r is the radius of the circle, and t is some angle
    const circleDrawInformationInput1: DrawableInput = this.getCircleDrawInformationInput(
      (_: number) => [
        center.x,
        center.y,
      ],
      (radians: number) => [
        radius * Math.sin(radians) + center.x,
        radius * Math.cos(radians) + center.y,
      ],
      Math.random() <= 0.5 ? 'dist/cover_example_1.png' : 'dist/cover_example_2.png',
    );
    const circleDrawInformationInput2: DrawableInput = this.getCircleDrawInformationInput(
      (radians: number) => [
        radius * Math.sin(radians) + center.x,
        radius * Math.cos(radians) + center.y,
      ],
      (radians: number) => [
        (radius + lineWidth) * Math.sin(radians) + center.x,
        (radius + lineWidth) * Math.cos(radians) + center.y,
      ],
    );

    super.setDrawInformationBatch(gl, [
      circleDrawInformationInput1,
      circleDrawInformationInput2,
    ]);
  }

  private getCircleDrawInformationInput(
    insideVertexFn: (radians: number) => number[],  // The inner vertex (closest to the center)
    outsideVertexFn: (radians: number) => number[], // The outer vertex (furthest from the center)
    textureURL?: string,
  ): DrawableInput {
    const vertices: number[] = [];
    const colours: number[] = [];
    const exampleColour1: number[] = [Math.random(), Math.random(), Math.random(), 1];
    const exampleColour2: number[] = [Math.random(), Math.random(), Math.random(), 1];

    for (
      let degrees = this.START_DEGREES;
      degrees <= this.END_DEGREES;
      degrees += this.RESOLUTION
    ) {
      const radians = Drawable.convert(degrees, Drawable.degreesToRadiansFn); // Degrees to radians

      const insideVertex: number[] = insideVertexFn(radians);
      const outsideVertex: number[] = outsideVertexFn(radians);

      vertices.push(...insideVertex, ...outsideVertex);
      colours.push(...exampleColour1, ...exampleColour2);
    }

    return {
      vertices,
      textureURL,
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
