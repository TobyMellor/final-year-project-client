import SongCircle from '../services/canvas/drawables/SongCircle';
import TrackModel from '../models/audio-analysis/Track';
import WorldPoint from '../services/canvas/drawables/points/WorldPoint';
import Scene from '../services/canvas/drawables/Scene';
import BezierCurve from '../services/canvas/drawables/BezierCurve';
import BranchModel from '../models/branches/Branch';
import BranchService from '../services/branch/BranchService';

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

  const branchService = await BranchService.getInstance();
  const branches = await branchService.getBranches();
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
  const trackDuration = songCircle.getTrack().getDuration();
  const originBeat = branch.getOriginBeat();
  const destinationBeat = branch.getDestinationBeat();

  const originPercentage = originBeat.getPercentageInTrack(trackDuration);
  const destinationPercentage = destinationBeat.getPercentageInTrack(trackDuration);
  const lineWidth = getBezierCurveLineWidth();

  // Render the curve
  new BezierCurve(scene,
                  songCircle,
                  branch,
                  originPercentage,
                  destinationPercentage,
                  lineWidth);
}

function getRadiusForSong(parentSongCircle: SongCircle, childTrack: TrackModel): number {
  const parentTrack = parentSongCircle.getTrack();
  const relativeSize = childTrack.getDuration().ms / parentTrack.getDuration().ms;

  return relativeSize * parentSongCircle.getRadius();
}

function getLineWidthForSong(radius: number): number {
  return radius * 0.1;
}

function getBezierCurveLineWidth(): number {
  return 5;
}
