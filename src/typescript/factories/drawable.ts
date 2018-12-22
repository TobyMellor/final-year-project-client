import SongCircle from '../services/canvas/drawables/SongCircle';
import TrackModel from '../models/audio-analysis/Track';
import WorldPoint from '../services/canvas/drawables/points/WorldPoint';
import Scene from '../services/canvas/drawables/Scene';
import BezierCurve from '../services/canvas/drawables/BezierCurve';
import BranchModel from '../models/branches/Branch';

export async function renderParentSongCircle(scene: Scene, track: TrackModel): Promise<SongCircle> {
  const pointOnCircle = WorldPoint.getPoint(0, 0);
  const radius = 1;
  const lineWidth = getLineWidthForSong(radius);
  const parentSongCircle = new SongCircle(scene,
                                          track,
                                          pointOnCircle,
                                          1,
                                          lineWidth,
                                          0xFFFFFF);

  const branches = await track.getBranches();
  branches.forEach(branch => renderBezierCurves(scene, parentSongCircle, branch));

  return parentSongCircle;
}

export function renderChildSongCircle(
  scene: Scene,
  parentSongCircle: SongCircle,
  track: TrackModel,
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

export function renderBezierCurves(
  scene: Scene,
  songCircle: SongCircle,
  branch: BranchModel,
) {
  new BezierCurve(scene, songCircle, branch, 20, 60, 1);
}

function getRadiusForSong(parentSongCircle: SongCircle, childTrack: TrackModel): number {
  const parentTrack = parentSongCircle.getTrack();
  const relativeSize = childTrack.getDurationMs() / parentTrack.getDurationMs();

  return relativeSize * parentSongCircle.getRadius();
}

function getLineWidthForSong(radius: number): number {
  return radius * 0.1;
}
