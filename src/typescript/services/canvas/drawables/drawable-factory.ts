import CanvasService from '../CanvasService';
import Point from './utils/Point';
import SongCircle from './SongCircle';
import Track from '../../../models/Track';

export function createParentSongCircle(track: Track): SongCircle {
  const gl: WebGLRenderingContext = getGL();
  const pointOnCircle = Point.getPoint(0, 0);
  const radius = 1;
  const lineWidth = getLineWidthForSong(radius);
  const parentSongCircle = new SongCircle(track,
                                          gl,
                                          pointOnCircle,
                                          1,
                                          lineWidth);

  return parentSongCircle;
}

export function createChildSongCircle(
  parentSongCircle: SongCircle,
  track: Track,
  percentage: number,
): SongCircle {
  const gl: WebGLRenderingContext = getGL();
  const radius = getRadiusForSong(parentSongCircle, track);
  const lineWidth = getLineWidthForSong(radius);

  const pointOnCircle = Point.getPointOnCircleFromPercentage(parentSongCircle,
                                                             percentage,
                                                             radius,
                                                             lineWidth);
  const childSongCircle = new SongCircle(track,
                                         gl,
                                         pointOnCircle,
                                         radius,
                                         lineWidth);

  return childSongCircle;
}

function getRadiusForSong(parentSongCircle: SongCircle, childTrack: Track): number {
  const parentTrack = parentSongCircle.getTrack();
  const relativeSize = childTrack.getDurationMs() / parentTrack.getDurationMs();

  return relativeSize * parentSongCircle.getRadius();
}

function getLineWidthForSong(radius: number): number {
  return radius * 0.1;
}

function getGL(): WebGLRenderingContext {
  const canvasService = CanvasService.getInstance();
  const gl: WebGLRenderingContext = canvasService.getGL();

  return gl;
}
