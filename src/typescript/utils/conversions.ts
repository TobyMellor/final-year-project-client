import { TimeIdentifier } from '../types/general';
import Scene from '../services/canvas/drawables/Scene';

export function degreesToRadians(degrees: number) {
  const radians = degrees * (Math.PI / 180);

  return radians % (2 * Math.PI);
}

export function radiansToDegrees(radians: number) {
  const degrees = radians * (180 / Math.PI);

  return degrees % 360;
}

export function percentageToDegrees(
  percentage: number,
  offsetAmountDegrees: number,
) {
  const decimal = percentage / 100;

  // Inverse so percentage is clockwise, to make
  // 25% appear on the right of the circle instead of the left
  const inversedDecimal = 1 - decimal;
  const degrees = inversedDecimal * 360;
  const degreesOffset = degrees + offsetAmountDegrees;

  return degreesOffset % 360;
}

export function percentageToRadians(percentage: number) {
  const degrees = percentageToDegrees(percentage, 90);
  const radians = degreesToRadians(degrees);

  return radians;
}

export function worldWidthToAbsoluteWidth(
  maxWidth: number,
  gl: WebGLRenderingContext,
) {
  // Width of the entire canvas in world coordinates
  const worldCanvasWidth = -Scene.CAMERA_POSITION[2];

  // Width of the circle in world coordinates
  const worldCircleWidth = maxWidth / worldCanvasWidth;

  // Width of the circle in pixels
  const absoluteCircleWidth = worldCircleWidth * gl.canvas.width / window.devicePixelRatio;

  return absoluteCircleWidth;
}

export function decimalToPercentage(decimal: number): number {
  return decimal * 100;
}

export function secondsToMilliseconds(seconds: number): number {
  return seconds * 1000;
}

export function millisecondsToSeconds(ms: number): number {
  return ms / 1000;
}

export function getTimeIdentifierFromSeconds(secs: number): TimeIdentifier {
  return {
    secs,
    ms: secondsToMilliseconds(secs),
  };
}

export function getTimeIdentifierFromMilliseconds(ms: number): TimeIdentifier {
  return {
    ms,
    secs: millisecondsToSeconds(ms),
  };
}