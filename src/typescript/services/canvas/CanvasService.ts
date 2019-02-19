/**
 * Canvas Service
 *
 * Handles everything to do with the canvas,
 * including animations, ThreeJS, circles,
 * branches, etc.
 */

import Dispatcher from '../../events/Dispatcher';
import Scene from '../canvas/drawables/Scene';
import * as drawableFactory from '../../factories/drawable';
import * as conversions from '../../utils/conversions';
import * as utils from '../../utils/misc';
import { FYPEvent } from '../../types/enums';
import WorldPoint from './drawables/utils/WorldPoint';
import Rotation from './drawables/utils/Rotation';
import { FYPEventPayload } from '../../types/general';
import BezierCurve from './drawables/BezierCurve';
import BranchModel from '../../models/branches/Branch';

class CanvasService {
  private static _instance: CanvasService = null;

  public scene: Scene = null;
  private _bezierCurves: BezierCurve[] = [];

  private constructor(canvas: HTMLCanvasElement) {
    const scene = this.scene = Scene.getInstance(canvas);

    // Once we've loaded and analyzed the playing track, display the song circles
    Dispatcher.getInstance()
              .on(FYPEvent.PlayingTrackBranchesAnalyzed, this, this.setSongCircles);

    // When the Branch Service has given us new beats, update the next branch
    Dispatcher.getInstance()
              .on(FYPEvent.BeatsReadyForQueueing, this, this.updateNextBezierCurve);

    const render = (nowMs: number) => {
      const nowSecs = conversions.millisecondsToSeconds(nowMs);
      scene.render(nowSecs);

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  }

  public static getInstance(canvas?: HTMLCanvasElement): CanvasService {
    if (this._instance) {
      return this._instance;
    }

    return this._instance = new this(canvas);
  }

  /**
   * Renders the parent circle for the playing track, and
   * renders the child tracks around the parent circle.
   *
   * Dispatches FYPEvent.PlayingTrackRendered when finished
   *
   * @param eventContents The track that's playing, and the loaded child tracks
   */
  public async setSongCircles(
    {
      playingTrack,
      childTracks,
      forwardAndBackwardBranches: [forwardBranches],
    }: FYPEventPayload['PlayingTrackBranchesAnalyzed'],
  ) {
    const parentSongCircle = drawableFactory.renderParentSongCircle(this.scene, playingTrack);

    this._bezierCurves = drawableFactory.renderBezierCurves(this.scene,
                                                            parentSongCircle,
                                                            forwardBranches);

    childTracks.forEach((childTrack) => {
      const percentage = utils.getRandomInteger();

      drawableFactory.renderChildSongCircle(this.scene,
                                            parentSongCircle,
                                            childTrack,
                                            percentage);
    });

    Dispatcher.getInstance()
              .dispatch(FYPEvent.PlayingTrackRendered);
  }

  /**
   * Adds highlighting to the next branch, removes highlighting for all
   * other branches
   *
   * @param eventPayload The next branch to be taken
   */
  public async updateNextBezierCurve({ nextBranch }: FYPEventPayload['BeatsReadyForQueueing']) {
    const bezierCurves = this._bezierCurves;
    const nextBezierCurve = bezierCurves.find(({ branch }) => {
      return BranchModel.isSameBranch(branch, nextBranch);
    }) || null;

    drawableFactory.updateNextBezierCurve(this._bezierCurves, nextBezierCurve);
  }

  public async updateCanvasRotation(percentage: number) {
    WorldPoint.rotationOffsetPercentage = percentage;
    Rotation.rotationOffsetPercentage = percentage;
  }
}

export default CanvasService;
