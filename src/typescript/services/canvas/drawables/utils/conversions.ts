import Point from './Point';
import Scene from '../Scene';
import { mat4 } from 'gl-matrix';

export function degreesToRadians(degrees: number) {
  const radians = degrees * (Math.PI / 180);

  return radians % (2 * Math.PI);
}

export function radiansToDegrees(radians: number) {
  const degrees = radians * (180 / Math.PI);

  return degrees % 360;
}

export function percentageToDegrees(percentage: number) {
  // How many degrees we need to rotate circles so "0%" appears at the top
  const OFFSET_AMOUNT_DEGREES = 90;
  const decimal = percentage / 100;

  // Inverse so percentage is clockwise, to make
  // 25% appear on the right of the circle instead of the left
  const inversedDecimal = 1 - decimal;
  const degrees = inversedDecimal * 360;

  // How many degrees we need to rotate circles so "0%" appears at the top
  const degreesOffset = degrees + OFFSET_AMOUNT_DEGREES;

  return degreesOffset % 360;
}

export function percentageToRadians(percentage: number) {
  const degrees = percentageToDegrees(percentage);
  const radians = degreesToRadians(degrees);

  return radians;
}

/**
 * Clipspace Point: A point between [-1, 1]
 * Local Point: An objects point is independent of others
 * World Point: Universal coordinates that objects share, independent from the camera
 * Canvas Point: A pixel on the Canvas. (0, 0) to (gl.canvas.width, gl.canvas.height)
 * Absolute Point: A pixel in the users browser. It's a canvas point,
 *                 plus the offset of the canvas itself
 */

export function worldPointToClipspacePoint(
  projectionMatrix: mat4,
  cameraMatrix: mat4,
  worldPoint: Point,
) {
  const worldPointMatrix = mat4.create();
  mat4.translate(worldPointMatrix, worldPointMatrix, [worldPoint.x, worldPoint.y, worldPoint.z]);

  const cameraTransformation = mat4.create();
  mat4.multiply(cameraTransformation, cameraMatrix, worldPointMatrix);

  const projectionTransformation = mat4.create();
  mat4.multiply(projectionTransformation, projectionMatrix, cameraTransformation);

  const w = projectionTransformation[15];
  const clipspacePoint = Point.getPoint(
    projectionTransformation[12] / w,
    projectionTransformation[13] / w,
    projectionTransformation[14] / w,
  );

  return clipspacePoint;
}

export function clipspacePointToCanvasPoint(
  gl: WebGLRenderingContext,
  clipspacePoint: Point,
): Point {
  // tslint:disable-next-line:variable-name How many CSS pixels in one physical
  const CSSPixelsToPhysical = 1 / window.devicePixelRatio;
  const canvasWidth = gl.canvas.width * CSSPixelsToPhysical;
  const canvasHeight = gl.canvas.height * CSSPixelsToPhysical;
  const x = (clipspacePoint.x * 0.5 + 0.5) * canvasWidth;
  const y = (clipspacePoint.y * -0.5 + 0.5) * canvasHeight;

  return Point.getPoint(x, y);
}

export function canvasPointToAbsolutePoint(
  gl: WebGLRenderingContext,
  canvasPoint: Point,
): Point {
  const canvas: HTMLCanvasElement = gl.canvas;
  const { offsetTop, offsetLeft } = canvas;

  return canvasPoint.translate(offsetLeft, offsetTop);
}

export function worldWidthToAbsoluteWidth(
  gl: WebGLRenderingContext,
  maxWidth: number,
) {
  // Width of the entire canvas in world coordinates
  const worldCanvasWidth = -Scene.CAMERA_POSITION[2];

  // Width of the circle in world coordinates
  const worldCircleWidth = maxWidth / worldCanvasWidth;

  // Width of the circle in pixels
  const absoluteCircleWidth = worldCircleWidth * gl.canvas.width / window.devicePixelRatio;

  return absoluteCircleWidth;
}
