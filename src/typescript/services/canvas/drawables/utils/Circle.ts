import * as conversions from './conversions';
import WorldPoint from '../points/WorldPoint';

class Circle {
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

  public getCircumference(): number {
    return this.outerRadius * 2;
  }
}

export default Circle;
