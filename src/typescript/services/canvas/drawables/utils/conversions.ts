import Point from './Point';
import Scene from '../Scene';

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

export function clipspacePointToLocalPoint(
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

export function localPointToAbsolutePoint(
  gl: WebGLRenderingContext,
  localPoint: Point,
): Point {
  const canvas: HTMLCanvasElement = gl.canvas;
  const { offsetTop, offsetLeft } = canvas;

  return localPoint.translate(offsetLeft, offsetTop);
}

export function localWidthToAbsoluteWidth(
  gl: WebGLRenderingContext,
  maxWidth: number,
) {
  // Width of the entire canvas in local coordinates
  const localCanvasWidth = -Scene.CAMERA_POSITION[2];

  // Width of the circle in local coordinates
  const localCircleWidth = maxWidth / localCanvasWidth;

  // Width of the circle in pixels
  const absoluteCircleWidth = localCircleWidth * gl.canvas.width / window.devicePixelRatio;

  return absoluteCircleWidth;
}
