import Point from './Point';
import * as conversions from '../utils/conversions';
import SongCircle from '../SongCircle';
import Circle from '../utils/Circle';

/**
 * World Point
 *
 * Universal coordinates that objects share,
 * independent from the camera
 */
class WorldPoint extends Point {
  public static rotationOffsetPercentage: number = 0;

  constructor(x: number, y: number, z: number = 1) {
    super(x, y, z);
  }

  public static getPoint(x: number, y: number, z: number = 1): WorldPoint {
    return new WorldPoint(x, y, z);
  }

  public static getCenterPointOfCircleFromPercentage(
    { center: parentCircleCenter, radius: parentCircleRadius }: SongCircle,
    percentage: number,
    ourCircleRadius: number = 0,
    ourCircleLineWidth: number = 1,
  ): WorldPoint {

    // Angle where our circle will sit from the parent's center point
    const angleRadians = this.getAngleFromPercentage(percentage);

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
    const angleRadians = this.getAngleFromPercentage(percentage);
    const circle = new Circle(parentCircleCenter, parentCircleRadius);

    return circle.getPointOnCircle(angleRadians);
  }

  private static getAngleFromPercentage(percentage: number): number {
    const percentageWithOffset = percentage + this.rotationOffsetPercentage;
    const angle: number = conversions.percentageToRadians(percentageWithOffset);

    return angle;
  }
}

export default WorldPoint;
