import SongCircle from '../services/canvas/drawables/SongCircle';
import TrackModel from '../models/audio-analysis/Track';
import Scene from '../services/canvas/drawables/Scene';
import BezierCurve from '../services/canvas/drawables/BezierCurve';
import BranchModel from '../models/branches/Branch';
import Needle, { NeedleType } from '../services/canvas/drawables/Needle';

export function renderParentSongCircle(
  scene: Scene,
  track: TrackModel,
): SongCircle {
  const radius = 1;
  const lineWidth = getLineWidthForSong(radius);
  const parentSongCircle = new SongCircle(scene,
                                          track,
                                          radius,
                                          lineWidth,
                                          null,
                                          -1,
                                          0xFFFFFF);

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
  branches: BranchModel[],
): BezierCurve[] {
  const trackDuration = songCircle.track.duration;

  function renderBezierCurve(branch: BranchModel): BezierCurve {
    const { earliestBeat, latestBeat } = branch;

    const earliestPercentage = earliestBeat.getPercentageInTrack(trackDuration);
    const latestPercentage = latestBeat.getPercentageInTrack(trackDuration);

    return renderBezierCurveFromPercentages(scene, songCircle, earliestPercentage, latestPercentage, branch);
  }

  return branches.map(branch => renderBezierCurve(branch));
}

export function renderBezierCurveFromPercentages(
  scene: Scene,
  songCircle: SongCircle,
  earliestPercentage: number | null,
  latestPercentage: number | null,
  branch: BranchModel = null,
): BezierCurve {
  return new BezierCurve(scene,
                         songCircle,
                         earliestPercentage,
                         latestPercentage,
                         branch);
}

export function updateNextBezierCurve(
  bezierCurves: BezierCurve[],
  nextBezierCurve: BezierCurve | null,
) {
  bezierCurves.forEach(bezierCurve => bezierCurve.isNext = false);

  if (nextBezierCurve) {
    nextBezierCurve.isNext = true;
  }
}

export function updateBezierCurve(bezierCurve: BezierCurve, earliestPercentage: number, latestPercentage: number) {
  bezierCurve.updatePercentages(earliestPercentage, latestPercentage);
}

export function renderNeedle(scene: Scene, songCircle: SongCircle, needleType: NeedleType, percentage: number): Needle {
  return new Needle(scene,
                    songCircle,
                    needleType,
                    percentage);
}

export function updateNeedle(needle: Needle, percentage: number) {
  // Offset whatever percentage we're given in order to fix it to the bottom
  const inversePercentage = 100 - percentage;

  needle.percentage = inversePercentage;
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
