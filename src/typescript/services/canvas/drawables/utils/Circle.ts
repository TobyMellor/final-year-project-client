import * as conversions from './conversions';
import WorldPoint from '../points/WorldPoint';

class Circle {
  private static RESOLUTION: number = 1;      // A lower number gives a higher resolution
  private static START_DEGREES: number = 0.0; // Where in the circle we should start drawing from
  private static END_DEGREES: number = 360.0; // Where in the circle we should stop drawing to

  private center: WorldPoint;
  private innerRadius: number;
  private outerRadius: number;

  constructor(
    center: WorldPoint,
    innerRadius: number,
    outerRadius: number,
  ) {
    this.center = center;
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;
  }

  // Parametric Equation of a circle:
  //   x = r cos(t)
  //   y = r sin(t)
  // Where r is the radius of the circle, and t is some angle
  private vertexEquation(radians: number, radius: number) {
    return [
      radius * Math.sin(radians) + this.center.x,
      radius * Math.cos(radians) + this.center.y,
      this.center.z,
    ];
  }

  private insideVertexEquation(radians: number) {
    return this.vertexEquation(radians, this.innerRadius);
  }

  private outsideVertexEquation(radians: number) {
    return this.vertexEquation(radians, this.outerRadius);
  }

  generateVertices(): number[] {
    const vertices: number[] = [];

    for (
      let degrees = Circle.START_DEGREES;
      degrees <= Circle.END_DEGREES;
      degrees += Circle.RESOLUTION
    ) {
      const radians = conversions.degreesToRadians(degrees); // Degrees to radians

      // The inner vertex (closest to the center)
      const insideVertex: number[] = this.insideVertexEquation(radians);

      // The outer vertex (furthest to the center)
      const outsideVertex: number[] = this.outsideVertexEquation(radians);

      vertices.push(...insideVertex, ...outsideVertex);
    }

    return vertices;
  }

  public getCircumference(): number {
    return this.outerRadius * 2;
  }
}

export default Circle;
