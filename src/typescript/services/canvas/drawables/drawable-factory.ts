import SongCircle from './SongCircle';
import Track from '../../../models/Track';
import WorldPoint from './points/WorldPoint';
import Scene from '../../canvas/drawables/Scene';

export function renderParentSongCircle(scene: Scene, track: Track): SongCircle {
  const pointOnCircle = WorldPoint.getPoint(0, 0);
  const radius = 1;
  const lineWidth = getLineWidthForSong(radius);
  const parentSongCircle = new SongCircle(scene,
                                          track,
                                          pointOnCircle,
                                          1,
                                          lineWidth,
                                          0xffffff);
  return parentSongCircle;
}

export function renderChildSongCircle(
  scene: Scene,
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
  const childSongCircle = new SongCircle(scene,
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
