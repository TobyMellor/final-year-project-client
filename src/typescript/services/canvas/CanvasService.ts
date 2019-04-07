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
import { FYPEvent, NeedleType } from '../../types/enums';
import { FYPEventPayload } from '../../types/general';
import BezierCurve from './drawables/BezierCurve';
import BranchModel from '../../models/branches/Branch';
import SongCircle from './drawables/SongCircle';
import Needle from './drawables/Needle';
import * as math from '../../utils/math';

class CanvasService {
  private static _instance: CanvasService = null;

  public scene: Scene = null;
  private _parentSongCircle: SongCircle | null = null;
  private _bezierCurves: BezierCurve[] = [];
  private _playingNeedle: Needle | null = null;
  private _branchNavNeedle: Needle | null = null;
  private _branchNavBezierCurve: BezierCurve | null = null;

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
    this._parentSongCircle = drawableFactory.renderParentSongCircle(this.scene, playingTrack);
    this._playingNeedle = drawableFactory.renderNeedle(this.scene, this._parentSongCircle, NeedleType.PLAYING, 0);

    this._bezierCurves = drawableFactory.renderBezierCurves(this.scene,
                                                            this._parentSongCircle,
                                                            backwardBranches);

    childTracks.forEach((childTrack) => {
      const percentage = math.getRandomInteger(); // TODO: Replace random position with an analysis of best entry

      drawableFactory.renderChildSongCircle(this.scene,
                                            this._parentSongCircle,
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

  public setSongCircleRotation(focusedNeedleType: NeedleType, percentage: number) {
    this.updateNeedle(focusedNeedleType, percentage);
    this.scene.setRotationPercentage(percentage);
  }

  public startSongCircleRotation({
    source,
    startPercentage,
    endPercentage,
    durationMs,
  }: FYPEventPayload['PlayingBeatBatch']) {
    const isBranchNavPreviewing = source === NeedleType.BRANCH_NAV;

    this.scene.animateRotation(
      startPercentage,
      endPercentage,
      durationMs,
      (rotationPercentage: number) => {
        if (this.isBranchNavOpen() || isBranchNavPreviewing) {
          // Update ONLY the needle
          this.updateNeedle(NeedleType.PLAYING, rotationPercentage);
          return;
        }

        // Update BOTH the needle and the rotation
        this.setSongCircleRotation(NeedleType.PLAYING, rotationPercentage);
      },
    );
  }

  public previewBezierCurve(earliestPercentage: number | null, latestPercentage: number | null = earliestPercentage) {
    if (this.isBranchNavOpen()) {
      drawableFactory.updateBezierCurve(this._branchNavBezierCurve, earliestPercentage, latestPercentage);
      return;
    }

    this._branchNavNeedle = drawableFactory.renderNeedle(this.scene, this._parentSongCircle, NeedleType.BRANCH_NAV, 0);
    this._branchNavBezierCurve = drawableFactory.renderBezierCurveFromPercentages(this.scene,
                                                                                  this._parentSongCircle,
                                                                                  earliestPercentage,
                                                                                  latestPercentage);
  }

  public removePreviewBezierCurve() {
    if (!this.isBranchNavOpen()) {
      return;
    }

    this.scene.remove(this._branchNavBezierCurve, this._branchNavNeedle);
    this._branchNavBezierCurve = this._branchNavBezierCurve = null;
  }

  public updateNeedle(needleType: NeedleType, percentage: number) {
    const needle = needleType === NeedleType.PLAYING ? this._playingNeedle : this._branchNavNeedle;

    if (!needle) {
      throw new Error('Needle has not been rendered yet!');
    }

    drawableFactory.updateNeedle(needle, percentage);
  }

  private isBranchNavOpen(): boolean {
    return this._branchNavBezierCurve !== null;
  }
}

export default CanvasService;
