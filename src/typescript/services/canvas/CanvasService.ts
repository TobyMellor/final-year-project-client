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
import { FYPEvent } from '../../types/enums';
import { FYPEventPayload } from '../../types/general';
import BezierCurve from './drawables/BezierCurve';
import BranchModel from '../../models/branches/Branch';
import * as math from '../../utils/math';

class CanvasService {
  private static _instance: CanvasService = null;

  public scene: Scene = null;
  private _bezierCurves: BezierCurve[] = [];

  private constructor(canvas: HTMLCanvasElement) {
    this.scene = Scene.getInstance(canvas);

    // Once we've loaded and analyzed the playing track, display the song circles
    Dispatcher.getInstance()
              .on(FYPEvent.PlayingTrackBranchesAnalyzed, this, this.setSongCircles);

    // When a beat batch has started, highlight the next branch to be taken
    Dispatcher.getInstance()
              .on(FYPEvent.PlayingBeatBatch, this, this.updateNextBezierCurve);

    // When a beat batch has started, start the animation
    Dispatcher.getInstance()
              .on(FYPEvent.PlayingBeatBatch, this, this.startSongCircleRotation);
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
      forwardAndBackwardBranches: [_, backwardBranches],
    }: FYPEventPayload['PlayingTrackBranchesAnalyzed'],
  ) {
    const parentSongCircle = drawableFactory.renderParentSongCircle(this.scene, playingTrack);

    this._bezierCurves = drawableFactory.renderBezierCurves(this.scene,
                                                            parentSongCircle,
                                                            backwardBranches);

    childTracks.forEach((childTrack) => {
      const percentage = math.getRandomInteger(); // TODO: Replace random position with an analysis of best entry

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
  public async updateNextBezierCurve({ nextBranch }: FYPEventPayload['PlayingBeatBatch']) {
    const bezierCurves = this._bezierCurves;
    const nextBezierCurve = bezierCurves.find(({ branch }) => {
      return BranchModel.isSameBranch(branch, nextBranch);
    }) || null;

    drawableFactory.updateNextBezierCurve(this._bezierCurves, nextBezierCurve);
  }

  public async render() {
    requestAnimationFrame(() => this.scene.render());
  }

  public setSongCircleRotation(percentage: number) {
    this.scene.setRotationPercentage(percentage);
  }

  public startSongCircleRotation({
    startPercentage,
    endPercentage,
    durationMs,
  }: FYPEventPayload['PlayingBeatBatch']) {
    this.scene.animateRotation(startPercentage, endPercentage, durationMs);
  }
}

export default CanvasService;
