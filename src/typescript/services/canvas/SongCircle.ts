import Drawable, { DrawInformation } from './Drawable';
import Point from './Point';

class SongCircle extends Drawable {
  private RESOLUTION: number = 1;             // A lower number gives a higher resolution
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

    const vertices: number[] = [];
    const colours: number[] = [];
    const exampleColor: number[] = [Math.random(), Math.random(), Math.random(), 1];

    for (let i = this.START_DEGREES; i <= this.END_DEGREES; i += this.RESOLUTION) {
      const j = Drawable.convert(i, Drawable.degreesToRadiansFn); // Degrees to radians

      // Parametric Equation of a circle:
      //   x = r cos(t)
      //   y = r cos(t)
      // Where r is the radius of the circle, and t is some angle

      // The inner vertex (closest to the center)
      const innerVertex = [
        radius * Math.sin(j) + center.x,
        radius * Math.cos(j) + center.y,
      ];

      // The outer vertex (furthest from the center)
      const outerVertex = [
        (radius + lineWidth) * Math.sin(j) + center.x,
        (radius + lineWidth) * Math.cos(j) + center.y,
      ];

      vertices.push(...innerVertex, ...outerVertex);
      colours.push(...exampleColor, ...exampleColor);
    }

    this.radius = radius;
    this.lineWidth = lineWidth;
    this.center = center;

    super.setDrawInformation(gl, vertices, colours);
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
