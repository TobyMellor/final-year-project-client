import Point from './Point';
import AbsolutePoint from './AbsolutePoint';

/**
 * Canvas Point
 *
 * A pixel on the Canvas.
 * (0, 0) to (gl.canvas.width, gl.canvas.height)
 */
class CanvasPoint extends Point {
  static getPoint(x: number, y: number, z: number = 1): CanvasPoint {
    return new CanvasPoint(x, y, z);
  }

  toAbsolutePoint(gl: WebGLRenderingContext): AbsolutePoint {
    const canvas: HTMLCanvasElement = gl.canvas;
    const { offsetTop, offsetLeft } = canvas;

    this.translate(offsetLeft, offsetTop);

    return AbsolutePoint.getPoint(this.x, this.y, this.z);
  }
}

export default CanvasPoint;
