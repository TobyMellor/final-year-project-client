import CanvasService from '../CanvasService';
import Point from './utils/Point';
import SongCircle from './SongCircle';

export function createParentSongCircle(
  radius: number,
  lineWidth: number,
): SongCircle {
  const gl: WebGLRenderingContext = getGL();
  const pointOnCircle: Point = Point.getPoint(0, 0);
  const parentSongCircle: SongCircle = new SongCircle(
    gl,
    pointOnCircle,
    radius,
    lineWidth);

  return parentSongCircle;
}

export function createChildSongCircle(
  parentSongCircle: SongCircle,
  percentage: number,
  radius: number,
  lineWidth: number,
): SongCircle {
  const gl: WebGLRenderingContext = getGL();
  const pointOnCircle: Point = Point.getPointOnCircleFromPercentage(
    parentSongCircle,
    percentage,
    radius,
    lineWidth);
  const childSongCircle: SongCircle = new SongCircle(
    gl,
    pointOnCircle,
    radius,
    lineWidth);

  return childSongCircle;
}

function getGL(): WebGLRenderingContext {
  const canvasService: CanvasService = CanvasService.getInstance();
  const gl: WebGLRenderingContext = canvasService.getGL();

  return gl;
}
