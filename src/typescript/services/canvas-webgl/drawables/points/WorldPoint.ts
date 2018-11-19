import Point from './Point';
import * as conversions from '../utils/conversions';
import SongCircle from '../SongCircle';
import { mat4 } from 'gl-matrix';
import ClipspacePoint from './ClipspacePoint';

/**
 * World Point
 *
 * Universal coordinates that objects share,
 * independent from the camera
 */
class WorldPoint extends Point {
  constructor(x: number, y: number, z: number = 1) {
    super(x, y, z);
  }

  static getPoint(x: number, y: number, z: number = 1): WorldPoint {
    return new WorldPoint(x, y, z);
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
    const angle: number = conversions.percentageToRadians(percentage);

    // Distance from our circles center to the parent's center point
    const centerToCenterDistance: number = parentCircleRadius +
                                           ourCircleRadius +
                                           ourCircleLineWidth;

    const x = parentCircleCenter.x + (centerToCenterDistance * Math.cos(angle));
    const y = parentCircleCenter.y + (centerToCenterDistance * Math.sin(angle));

    return new WorldPoint(x, y, 1);
  }

  toClipspacePoint(projectionMatrix: mat4, cameraMatrix: mat4): ClipspacePoint {
    const worldPointMatrix = mat4.create();
    mat4.translate(worldPointMatrix, worldPointMatrix, [this.x, this.y, this.z]);

    const cameraTransformation = mat4.create();
    mat4.multiply(cameraTransformation, cameraMatrix, worldPointMatrix);

    const projectionTransformation = mat4.create();
    mat4.multiply(projectionTransformation, projectionMatrix, cameraTransformation);

    const w = projectionTransformation[15];
    const clipspacePoint = ClipspacePoint.getPoint(
      projectionTransformation[12] / w,
      projectionTransformation[13] / w,
      projectionTransformation[14] / w,
    );

    return clipspacePoint;
  }
}

export default WorldPoint;
