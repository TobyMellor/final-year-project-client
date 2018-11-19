import SongCircle from '../SongCircle';
import * as conversions from '../utils/conversions';

// tslint:disable:variable-name
abstract class Point {
  public x: number;
  public y: number;
  public z: number;

  constructor(x: number, y: number, z: number = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public translate(addX: number, addY: number, addZ: number = 0): Point {
    this.x = this.x + addX;
    this.y = this.y + addY;
    this.z = this.z + addZ;

    return this;
  }
}

export default Point;
