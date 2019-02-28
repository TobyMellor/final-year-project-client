import Primitive from './Primitive';
import SongCircle from '../SongCircle';
import Circle from './Circle';
import * as conversions from '../../../../utils/conversions';

/**
 * World Point
 *
 * Universal coordinates that objects share,
 * independent from the camera
 */
class WorldPoint extends Primitive {
  // What percentage about the origin should all WorldPoints be rotated by?
  public static rotationOffsetPercentage: number = 0;

  private constructor(x: number, y: number, z: number = 1) {
    super(x, y, z);
  }

  public static getPoint(x: number, y: number, z: number = 1): WorldPoint {
    return new WorldPoint(x, y, z);
  }

  public static getOrigin(): WorldPoint {
    return new WorldPoint(0, 0, 0);
  }

  public rotate(degrees: number) {
    const radians = conversions.degreesToRadians(degrees);
    const cosTheta = Math.cos(radians);
    const sinTheta = Math.sin(radians);

    const newX = this.x * cosTheta - this.y * sinTheta;
    const newY = this.y * cosTheta + this.x * sinTheta;

    return WorldPoint.getPoint(newX, newY, this.z);
  }

  public static getCenterPointOfCircleFromPercentage(
    { center: parentCircleCenter, radius: parentCircleRadius }: SongCircle,
    percentage: number,
    ourCircleRadius: number = 0,
    ourCircleLineWidth: number = 1,
  ): WorldPoint {
    // Angle where our circle will sit from the parent's center point
    const angleRadians = super.getAngleFromPercentage(percentage, this.rotationOffsetPercentage);

    // Distance from our circles center to the parent's center point
    const centerToCenterDistance: number = parentCircleRadius +
                                           ourCircleRadius +
                                           ourCircleLineWidth;
    const circle = new Circle(parentCircleCenter, centerToCenterDistance);

    return circle.getPointOnCircle(angleRadians);
  }

  public static getPointOnCircleFromPercentage(
    { center: parentCircleCenter, radius: parentCircleRadius }: SongCircle,
    percentage: number,
  ): WorldPoint {
    const angleRadians = super.getAngleFromPercentage(percentage, this.rotationOffsetPercentage);
    const circle = new Circle(parentCircleCenter, parentCircleRadius);

    return circle.getPointOnCircle(angleRadians);
  }
}

export default WorldPoint;
