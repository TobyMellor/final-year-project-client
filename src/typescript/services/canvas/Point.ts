import SongCircle from './SongCircle';
import Drawable from './Drawable';

// tslint:disable:variable-name
class Point {
  private _x: number;
  private _y: number;
  private _z: number;

  constructor(x: number, y: number, z: number = 1) {
    this._x = x;
    this._y = y;
    this._z = z;
  }

  static getPoint(x: number, y: number, z: number = 1): Point {
    return new Point(x, y, z);
  }

  static getPointOnCircleFromPercentage(
    circle: SongCircle,
    percentage: number,
    offsetRadius: number = 0,
  ) {
    const circleCenter: Point = circle.getCenter();
    const circleRadius: number = circle.getRadius();
    const angle: number = Drawable.convert(percentage, Drawable.percentageToRadiansFn);

    console.log(circleCenter.x, circleCenter.y, circleRadius, angle);

    // TODO: Move parametric equation of a circle to it's own fn
    const x = circleCenter.x + (circleRadius * Math.cos(angle)) + offsetRadius;
    const y = circleCenter.y + (circleRadius * Math.sin(angle)) + offsetRadius;

    // TODO: Change Z depth to cover main circle
    return new Point(x, y, 1);
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get z() {
    return this._z;
  }
}

export default Point;
