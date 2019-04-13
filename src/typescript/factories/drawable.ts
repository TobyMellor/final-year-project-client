import SongCircle from '../services/canvas/drawables/SongCircle';
import TrackModel from '../models/audio-analysis/Track';
import Scene from '../services/canvas/drawables/Scene';
import BezierCurve from '../services/canvas/drawables/BezierCurve';
import BranchModel from '../models/branches/Branch';
import Needle from '../services/canvas/drawables/Needle';
import { NeedleType, BezierCurveType, SongCircleType, AnimationType } from '../types/enums';
import Updatable from '../services/canvas/drawables/Updatable';

export function renderParentSongCircle(
  scene: Scene,
  track: TrackModel,
): SongCircle {
  const type = SongCircleType.PARENT;
  const parentSongCircle = new SongCircle({
    scene,
    type,
    track,
  });

  return parentSongCircle;
}

export function renderChildSongCircle(
  scene: Scene,
  parentSongCircle: SongCircle,
  track: TrackModel,
  percentage: number,
): SongCircle {
  const type = SongCircleType.CHILD;
  const childSongCircle = new SongCircle({
    scene,
    type,
    track,
    parentSongCircle,
    percentage,
  });

  return childSongCircle;
}

export function renderBezierCurves(
  scene: Scene,
  songCircle: SongCircle,
  type: BezierCurveType,
  branches: BranchModel[],
): BezierCurve[] {
  const trackDuration = songCircle.track.duration;

  function renderBezierCurve(branch: BranchModel): BezierCurve {
    const { earliestBeat, latestBeat } = branch;

    const earliestPercentage = earliestBeat.getPercentageInTrack(trackDuration);
    const latestPercentage = latestBeat.getPercentageInTrack(trackDuration);

    return renderBezierCurveFromPercentages(scene,
                                            songCircle,
                                            type,
                                            earliestPercentage,
                                            latestPercentage,
                                            branch);
  }

  return branches.map(branch => renderBezierCurve(branch));
}

export function renderBezierCurveFromPercentages(
  scene: Scene,
  songCircle: SongCircle,
  type: BezierCurveType,
  fromPercentage: number | null,
  toPercentage: number | null,
  branch: BranchModel = null,
): BezierCurve {
  return new BezierCurve({
    scene,
    songCircle,
    type,
    fromPercentage,
    toPercentage,
    branch,
  });
}

export function updateNextBezierCurve(
  bezierCurves: BezierCurve[],
  nextBezierCurve: BezierCurve | null,
) {
  bezierCurves.forEach(bezierCurve => bezierCurve.type = BezierCurveType.NORMAL);

  if (nextBezierCurve) {
    nextBezierCurve.type = BezierCurveType.NEXT;
  }
}

export function updateBezierCurve(
  bezierCurve: BezierCurve,
  type: BezierCurveType,
  earliestPercentage: number,
  latestPercentage: number,
) {
  bezierCurve.type = type;
  bezierCurve.updatePercentages(earliestPercentage, latestPercentage);
}

export function renderNeedle(scene: Scene, songCircle: SongCircle, needleType: NeedleType, percentage: number): Needle {
  return new Needle({
    scene,
    songCircle,
    needleType,
    percentage,
  });
}

export function updateNeedle(needle: Needle, percentage: number) {
  needle.percentage = percentage;
}

export function updateSongCircleType(songCircle: SongCircle, type: SongCircleType) {
  songCircle.type = type;
}

export function transitionChildToParent(
  parentSongCircle: SongCircle,
  nextParentSongCircle: SongCircle,
  childSongCircles: SongCircle[],
  parentBezierCurves: BezierCurve[],
  childBezierCurves: BezierCurve[],
) {
  Updatable.animate(AnimationType.FADE_OUT, ...parentBezierCurves, ...childSongCircles);
  Updatable.animate(AnimationType.FADE_IN, ...childBezierCurves);

  updateSongCircleType(parentSongCircle, SongCircleType.CHILD);
  updateSongCircleType(nextParentSongCircle, SongCircleType.PARENT);
}
