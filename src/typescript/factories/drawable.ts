import SongCircle from '../services/canvas/drawables/SongCircle';
import TrackModel from '../models/audio-analysis/Track';
import Scene from '../services/canvas/drawables/Scene';
import BezierCurve from '../services/canvas/drawables/BezierCurve';
import BranchModel from '../models/branches/Branch';
import Needle from '../services/canvas/drawables/Needle';
import { NeedleType, BezierCurveType } from '../types/enums';
import config from '../config';

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
                                          config.drawables.songCircle.colour.background);

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

    return renderBezierCurveFromPercentages(scene,
                                            songCircle,
                                            BezierCurveType.NORMAL,
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
  earliestPercentage: number | null,
  latestPercentage: number | null,
  branch: BranchModel = null,
): BezierCurve {
  return new BezierCurve(scene,
                         songCircle,
                         type,
                         earliestPercentage,
                         latestPercentage,
                         branch);
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
  return new Needle(scene,
                    songCircle,
                    needleType,
                    percentage);
}

export function updateNeedle(needle: Needle, percentage: number) {
  needle.percentage = percentage;
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
