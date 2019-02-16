import SongCircle from '../services/canvas/drawables/SongCircle';
import TrackModel from '../models/audio-analysis/Track';
import WorldPoint from '../services/canvas/drawables/utils/WorldPoint';
import Scene from '../services/canvas/drawables/Scene';
import BezierCurve from '../services/canvas/drawables/BezierCurve';
import BranchModel from '../models/branches/Branch';
import BranchService from '../services/branch/BranchService';

export async function renderParentSongCircle(scene: Scene, track: TrackModel): Promise<SongCircle> {
  const radius = 1;
  const lineWidth = getLineWidthForSong(radius);
  const parentSongCircle = new SongCircle(scene,
                                          track,
                                          radius,
                                          lineWidth,
                                          null,
                                          -1,
                                          0xFFFFFF);

  // FIXME: Should be passed as a parameter, sent initially by the
  // branch service
  const { branches } = await BranchService.getInstance();
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
  const childSongCircle = new SongCircle(scene,
                                         track,
                                         radius,
                                         lineWidth,
                                         parentSongCircle,
                                         percentage);

  return childSongCircle;
}

export function renderBezierCurves(
  scene: Scene,
  songCircle: SongCircle,
  branch: BranchModel,
) {
  const trackDuration = songCircle.track.duration;
  const { earliestBeat, latestBeat } = branch;

  const earliestPercentage = earliestBeat.getPercentageInTrack(trackDuration);
  const latestPercentage = latestBeat.getPercentageInTrack(trackDuration);
  const lineWidth = getBezierCurveLineWidth();

  // Render the curve
  new BezierCurve(scene,
                  songCircle,
                  branch,
                  earliestPercentage,
                  latestPercentage,
                  lineWidth);
}

function getRadiusForSong(
  { track: parentTrack, radius: parentRadius }: SongCircle,
  childTrack: TrackModel,
): number {
  const relativeSize = childTrack.duration.ms / parentTrack.duration.ms;

  return relativeSize * parentRadius;
}

function getLineWidthForSong(radius: number): number {
  return radius * 0.1;
}

export function getBezierCurveLineWidth(): number {
  return 5;
}
