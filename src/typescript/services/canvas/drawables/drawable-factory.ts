import CanvasService from '../CanvasService';
import SongCircle from './SongCircle';
import Track from '../../../models/Track';
import WorldPoint from './points/WorldPoint';
import Scene from '../../canvas/drawables/Scene';

export function createParentSongCircle(track: Track): SongCircle {
  const pointOnCircle = WorldPoint.getPoint(0, 0);
  const radius = 1;
  const lineWidth = getLineWidthForSong(radius);
  const parentSongCircle = new SongCircle(Scene.THREE,
                                          track,
                                          pointOnCircle,
                                          1,
                                          lineWidth,
                                          0xffffff);
  return parentSongCircle;
}

export function createChildSongCircle(
  parentSongCircle: SongCircle,
  track: Track,
  percentage: number,
): SongCircle {
  const radius = getRadiusForSong(parentSongCircle, track);
  const lineWidth = getLineWidthForSong(radius);
  const pointOnCircle = WorldPoint.getPointOnCircleFromPercentage(parentSongCircle,
                                                                  percentage,
                                                                  radius,
                                                                  lineWidth);
  const childSongCircle = new SongCircle(Scene.THREE,
                                         track,
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
