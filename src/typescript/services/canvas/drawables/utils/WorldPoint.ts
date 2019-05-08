import Primitive from './Primitive';
import SongCircle from '../SongCircle';
import Circle from './Circle';
import * as conversions from '../../../../utils/conversions';
import * as THREE from 'three';

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

  public flip() {
    const newY = this.y * -1;

    return WorldPoint.getPoint(this.x, newY, this.z);
  }

  public static getCenterPointOfCircleFromPercentage(
    songCircle: SongCircle,
    percentage: number,
    ourCircleRadius: number = 0,
    ourCircleLineWidth: number = 1,
  ): WorldPoint {
    // Angle where our circle will sit from the parent's center point
    const angleRadians = super.getAngleFromPercentage(percentage, this.rotationOffsetPercentage);

    // Distance from our circles center to the parent's center point
    const centerToCenterDistance: number = songCircle.radius +
                                           ourCircleRadius +
                                           ourCircleLineWidth;
    const circle = new Circle(songCircle.getCenter(), centerToCenterDistance);

    return circle.getPointOnCircle(angleRadians);
  }

  /**
   * Gets a WorldPoint on a circle from a percentage
   *
   * @param songCircle The circle to get the point on
   * @param percentage The percentage on the circle to get
   * @param rotationOffsetOverride A rotation offset is added so 50% half way through a song
   *                               will appear 50% relative to the songCircles current rotation.
   *                               This can be manually overridden if you always want to, say,
   *                               fix something to the bottom of a circle
   */
  public static getPointOnSongCircleFromPercentage(
    centerPoint: WorldPoint,
    songCircle: SongCircle,
    percentage: number,
  ): WorldPoint {
    return WorldPoint.getPointOnCircleFromPercentage(centerPoint, songCircle.radius, percentage);
  }

  public static getPointOnCircleFromPercentage(
    centerPoint: WorldPoint,
    radius: number,
    percentage: number,
    rotationOffsetPercentage: number = this.rotationOffsetPercentage,
  ) {
    const angleRadians = super.getAngleFromPercentage(percentage, rotationOffsetPercentage);
    const circle = new Circle(centerPoint, radius);

    return circle.getPointOnCircle(angleRadians);
  }

  public toVector3(): THREE.Vector3 {
    return new THREE.Vector3(
      this.x,
      this.y,
      this.z,
    );
  }

  /**
   * Determines if a point lies outside, not on, the circle.
   *
   * Uses the equation: x^2 + y^2 = r, which is:
   *   - x^2 + y^2 < r if lies within
   *   - x^2 + y^2 = r if lies on
   *   - x^2 + y^2 > r if lies outside
   *
   * @param point The point to check
   * @param songCircle The circle to check
   */
  public static isPointOutsideCircle({ x, y }: WorldPoint, { radius }: SongCircle): boolean {
    return Math.pow(x, 2) + Math.pow(y, 2) > radius;
  }
}

export default WorldPoint;
