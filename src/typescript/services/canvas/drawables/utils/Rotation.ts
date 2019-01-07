import Primitive from './Primitive';

class Rotation extends Primitive {
  public static rotationOffsetPercentage: number = 0;

  private constructor(x: number = 0, y: number = 0, z: number = 0) {
    super(x, y, z);
  }

  public static getZero(): Rotation {
    return new Rotation();
  }

  public static getRotationFromPercentage(percentage: number): Rotation {
    const angleRadians = super.getAngleFromPercentage(percentage, this.rotationOffsetPercentage);
    const zeroRotation = this.getZero();

    // Rotate about the Z axis only (the axis that the camera is looking down)
    zeroRotation.z = angleRadians;

    return zeroRotation;
  }
}

export default Rotation;
