import * as conversions from './conversions';
import WorldPoint from '../points/WorldPoint';

class Circle {
  constructor(
    private _center: WorldPoint,
    private _innerRadius: number,
    private _outerRadius: number = _innerRadius,
  ) {}

  public getCircumference(): number {
    return this._outerRadius * 2;
  }

  public getPointOnCircle(angleRadians: number, shouldUseOuterRadius: boolean = true): WorldPoint {
    const radius = shouldUseOuterRadius ? this._outerRadius : this._innerRadius;
    const x = (radius * Math.cos(angleRadians)) + this._center.x;
    const y = (radius * Math.sin(angleRadians)) + this._center.y;

    return WorldPoint.getPoint(x, y);
  }
}

export default Circle;
