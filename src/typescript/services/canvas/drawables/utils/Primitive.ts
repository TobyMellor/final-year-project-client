import * as conversions from '../../../../utils/conversions';
import Scene from '../Scene';
import WorldPoint from './WorldPoint';

abstract class Primitive {
  public x: number;
  public y: number;
  public z: number;
  public abstract rotate(degrees: number): any;
  public abstract flip(): any;

  constructor(x: number, y: number, z: number = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public translate(addX: number, addY: number, addZ: number = 0): this {
    this.x += addX;
    this.y += addY;
    this.z += addZ;

    return this;
  }

  public rotateAndFlip(degrees: number): this {
    return this.rotate(degrees).flip();
  }

  protected static getAngleFromPercentage(
    percentage: number,
    offsetPercentage: number = 0,
  ): number {
    const percentageWithOffset = percentage - offsetPercentage;
    const angle: number = conversions.percentageToRadians(percentageWithOffset);

    return angle;
  }

  public alignToSceneBase() {
    const newZ = Scene.Z_BASE_DISTANCE;

    return WorldPoint.getPoint(this.x, this.y, newZ);
  }

  public alignToCameraBase() {
    return WorldPoint.getPoint(this.x, this.y, 0);
  }
}

export default Primitive;
