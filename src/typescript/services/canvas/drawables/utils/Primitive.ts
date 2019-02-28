import * as conversions from '../../../../utils/conversions';

abstract class Primitive {
  public x: number;
  public y: number;
  public z: number;
  public abstract rotate(degrees: number): void;

  constructor(x: number, y: number, z: number = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public translate(addX: number, addY: number, addZ: number = 0): Primitive {
    this.x += addX;
    this.y += addY;
    this.z += addZ;

    return this;
  }

  protected static getAngleFromPercentage(
    percentage: number,
    offsetPercentage: number = 0,
  ): number {
    const percentageWithOffset = percentage + offsetPercentage;
    const angle: number = conversions.percentageToRadians(percentageWithOffset);

    return angle;
  }
}

export default Primitive;
