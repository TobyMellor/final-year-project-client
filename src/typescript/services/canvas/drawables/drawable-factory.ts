import SongCircle from './SongCircle';
import Track from '../../../models/Track';
import WorldPoint from './points/WorldPoint';
import Scene from './Scene';
import Branch from './Branch';

export function renderParentSongCircle(scene: Scene, track: Track): SongCircle {
  const pointOnCircle = WorldPoint.getPoint(0, 0);
  const radius = 1;
  const lineWidth = getLineWidthForSong(radius);
  const parentSongCircle = new SongCircle(scene,
                                          track,
                                          pointOnCircle,
                                          1,
                                          lineWidth,
                                          0xFFFFFF);
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

export function renderBranches(scene: Scene, parentSongCircle: SongCircle): Branch[] {
  const bezierCurve = new Branch(scene, parentSongCircle, 20, 60, 1);

  return [];
}

function getRadiusForSong(parentSongCircle: SongCircle, childTrack: Track): number {
  const parentTrack = parentSongCircle.getTrack();
  const relativeSize = childTrack.getDurationMs() / parentTrack.getDurationMs();

  return relativeSize * parentSongCircle.getRadius();
}

function getLineWidthForSong(radius: number): number {
  return radius * 0.1;
}
