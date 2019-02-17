import SongCircle from '../services/canvas/drawables/SongCircle';
import TrackModel from '../models/audio-analysis/Track';
import Scene from '../services/canvas/drawables/Scene';
import BezierCurve from '../services/canvas/drawables/BezierCurve';
import BranchModel from '../models/branches/Branch';

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

    return new BezierCurve(scene,
                           songCircle,
                           branch,
                           earliestPercentage,
                           latestPercentage);
  }

  return branches.map(branch => renderBezierCurve(branch));
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
