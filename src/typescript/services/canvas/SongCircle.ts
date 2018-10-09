import Drawable, {
  DrawInformation,
  Input as DrawableInput,
  InputBatch as DrawableInputBatch,
} from './Drawable';
import Point from './Point';

class SongCircle extends Drawable {
  private RESOLUTION: number = 1;      // A lower number gives a higher resolution
  private START_DEGREES: number = 0.0; // Where in the circle we should start drawing from
  private END_DEGREES: number = 360.0; // Where in the circle we should stop drawing to

  private radius: number;
  private lineWidth: number;
  private center: Point;

  constructor(
    gl: WebGLRenderingContext,
    center: Point,
    radius: number,
    lineWidth: number = 1,
  ) {
    super();

    this.radius = radius;
    this.lineWidth = lineWidth;
    this.center = center;

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
      'dist/cover_example_1.png',
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
}

export default SongCircle;
