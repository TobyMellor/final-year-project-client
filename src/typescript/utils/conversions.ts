import { TimeIdentifier, RGB } from '../types/general';
import Scene from '../services/canvas/drawables/Scene';
import * as math from './math';

export function degreesToRadians(degrees: number) {
  const radians = degrees * (Math.PI / 180);

  return radians % (2 * Math.PI);
}

export function radiansToDegrees(radians: number) {
  const degrees = radians * (180 / Math.PI);

  return degrees % 360;
}

export function percentageToDegrees(percentage: number) {
  const decimal = percentage / 100;
  const degrees = decimal * 360;

  return degrees % 360;
}

export function percentageToRadians(percentage: number) {
  const degrees = percentageToDegrees(percentage);
  const radians = degreesToRadians(degrees);

  return radians;
}

export function canvasPointToNDC(pointX: number, pointY: number): [number, number] {
  function getNormalizedPoint(point: number, windowSize: number): number {
    const newPoint = point - (windowSize / 2);
    const normalizedPoint = math.normalizeNumber(newPoint, -windowSize, windowSize, -1, 1);

    return normalizedPoint;
  }

  return [
    getNormalizedPoint(pointX, window.innerWidth),
    getNormalizedPoint(pointY, window.innerHeight),
  ];
}

export function decimalToPercentage(decimal: number): number {
  return decimal * 100;
}

export function percentageToDecimal(percentage: number): number {
  return percentage / 100;
}

export function secsToMs(seconds: number): number {
  return seconds * 1000;
}

export function msToSecs(ms: number): number {
  return ms / 1000;
}

export function getTimeIdentifierFromSecs(secs?: number): TimeIdentifier | null {
  if (!secs && secs !== 0) {
    return null;
  }

  return {
    secs,
    ms: secsToMs(secs),
  };
}

export function getTimeIdentifierFromMs(ms?: number): TimeIdentifier {
  if (!ms && ms !== 0) {
    return null;
  }

  return {
    ms,
    secs: msToSecs(ms),
  };
}

// Edited from original function: https://stackoverflow.com/a/8469042/2957677
export function rgbToDecimal(r: number, g: number, b: number): number {
  return (r << 16) + (g << 8) + b;
}

// Edited from original function: https://stackoverflow.com/a/8469042/2957677
export function decimalToRgb(decimal: number): RGB {
  return [
    (decimal & 0xff0000) >> 16,
    (decimal & 0x00ff00) >> 8,
    (decimal & 0x0000ff),
  ];
}
