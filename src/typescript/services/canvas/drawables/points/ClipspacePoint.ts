import Point from './Point';
import * as conversions from '../utils/conversions';
import CanvasPoint from './CanvasPoint';

/**
 * Clipspace Point
 *
 * A point normalized between -1 and 1
 */
class ClipspacePoint extends Point {
  static getPoint(x: number, y: number, z: number = 1): ClipspacePoint {
    return new ClipspacePoint(x, y, z);
  }

  toCanvasPoint(gl: WebGLRenderingContext): CanvasPoint {
    // tslint:disable-next-line:variable-name How many CSS pixels in one physical
    const CSSPixelsToPhysical = 1 / window.devicePixelRatio;
    const canvasWidth = gl.canvas.width * CSSPixelsToPhysical;
    const canvasHeight = gl.canvas.height * CSSPixelsToPhysical;
    this.x = (this.x * 0.5 + 0.5) * canvasWidth;
    this.y = (this.y * -0.5 + 0.5) * canvasHeight;

    return CanvasPoint.getPoint(this.x, this.y, this.z);
  }
}

export default ClipspacePoint;
