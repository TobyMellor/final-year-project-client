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
    parentCircle: SongCircle,
    percentage: number,
    ourCircleRadius: number = 0,
    ourCircleLineWidth: number = 1,
  ) {
    // Details about the center (parent) circle that we want to "connect" to
    const parentCircleCenter: Point = parentCircle.getCenter();
    const parentCircleRadius: number = parentCircle.getRadius();

    // Angle where our circle will sit from the parent's center point
    const angle: number = Drawable.convert(percentage, Drawable.percentageToRadiansFn);

    // Distance from our circles center to the parent's center point
    const centerToCenterDistance: number = parentCircleRadius +
                                           ourCircleRadius +
                                           ourCircleLineWidth;

    // TODO: Move parametric equation of a circle to it's own fn
    const x = parentCircleCenter.x + (centerToCenterDistance * Math.cos(angle));
    const y = parentCircleCenter.y + (centerToCenterDistance * Math.sin(angle));

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
