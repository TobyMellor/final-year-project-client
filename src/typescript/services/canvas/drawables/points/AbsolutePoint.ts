import Point from './Point';

/**
 * Absolute Point
 *
 * A pixel in the users browser. It's a canvas point,
 * plus the offset of the canvas itself
 */
class AbsolutePoint extends Point {
  static getPoint(x: number, y: number, z: number = 1): AbsolutePoint {
    return new AbsolutePoint(x, y, z);
  }
}

export default AbsolutePoint;
