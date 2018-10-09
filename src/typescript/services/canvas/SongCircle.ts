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

    // Parametric Equation of a circle:
    //   x = r cos(t)
    //   y = r cos(t)
    // Where r is the radius of the circle, and t is some angle
    const circleDrawInformationInput1: DrawableInput = this.getCircleDrawInformationInput(
      (_: number) => [
        center.x,
        center.y,
      ],
      (j: number) => [
        radius * Math.sin(j) + center.x,
        radius * Math.sin(j) + center.y,
      ],
      'dist/cover_example_1.png',
    );
    const circleDrawInformationInput2: DrawableInput = this.getCircleDrawInformationInput(
      (j: number) => [
        radius * Math.sin(j) + center.x,
        radius * Math.sin(j) + center.y,
      ],
      (j: number) => [
        (radius + lineWidth) * Math.sin(j) + center.x,
        (radius + lineWidth) * Math.sin(j) + center.y,
      ],
      'dist/cover_example_1.png',
    );

    this.radius = radius;
    this.lineWidth = lineWidth;
    this.center = center;

    super.setDrawInformationBatch(gl, [circleDrawInformationInput1, circleDrawInformationInput2]);
  }

  private getCircleDrawInformationInput(
    insideVertexFn: (j: number) => number[],  // The inner vertex (closest to the center)
    outsideVertexFn: (j: number) => number[], // The outer vertex (furthest from the center)
    textureURL?: string,
  ): DrawableInput {
    const vertices: number[] = [];
    const colours: number[] = [];
    const exampleColour1: number[] = [Math.random(), Math.random(), Math.random(), 1];
    const exampleColour2: number[] = [Math.random(), Math.random(), Math.random(), 1];

    for (let i = this.START_DEGREES; i <= this.END_DEGREES; i += this.RESOLUTION) {
      const j = Drawable.convert(i, Drawable.degreesToRadiansFn); // Degrees to radians

      const insideVertex: number[] = insideVertexFn(j);
      const outsideVertex: number[] = outsideVertexFn(j);

      vertices.push(...insideVertex, ...outsideVertex);
      colours.push(...exampleColour1, ...exampleColour2);
    }

    return {
      vertices,
      colours,
      textureURL,
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
