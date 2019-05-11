import Dispatcher from '../../events/Dispatcher';
import Scene from '../canvas/drawables/Scene';
import * as drawableFactory from '../../factories/drawable';
import {
  FYPEvent,
  NeedleType,
  BezierCurveType,
  AnimationType,
  SongCircleType,
  AnimationCurve,
} from '../../types/enums';
import { FYPEventPayload } from '../../types/general';
import BezierCurve from './drawables/BezierCurve';
import BranchModel from '../../models/branches/Branch';
import SongCircle from './drawables/SongCircle';
import Needle from './drawables/Needle';
import * as math from '../../utils/math';
import TrackModel from '../../models/audio-analysis/Track';
import SongTransitionModel from '../../models/SongTransition';
import Updatable from './drawables/Updatable';
import config from '../../config';
import * as conversions from '../../utils/conversions';
import WorldPoint from './drawables/utils/WorldPoint';
import Rotation from './drawables/utils/Rotation';

class CanvasService {
  private static _instance: CanvasService = null;

  public scene: Scene = null;
  private _playingTrackID: string;
  private _songCircles: { [trackID: string]: SongCircle } = {};
  private _bezierCurves: { [trackID: string]: BezierCurve[] } = {};
  private _needles: { [type: string]: Needle } = {};
  private _branchNavBezierCurve: BezierCurve | null = null;
  private _isAnimating = false;

  private constructor(canvas: HTMLCanvasElement) {
    this.scene = Scene.getInstance(canvas,
                                  (p: WorldPoint) => this.handleMouseMove(p),
                                  (p: WorldPoint) => this.handleMouseClick(p));

    Dispatcher.getInstance()
              .on(FYPEvent.TrackChangeRequested, ({ track }: FYPEventPayload['TrackChangeRequested']) => {
                if (!this._playingTrackID) {
                  this.renderParentSongCircle(track);
                } else {
                  this.updateChildSongCircle(track, SongCircleType.NEXT_PARENT_LOADING);
                }
              });

    Dispatcher.getInstance()
              .on(FYPEvent.BranchesAnalyzed, ({ track, branches }: FYPEventPayload['BranchesAnalyzed']) => {
                const curveType = this._playingTrackID === track.ID ? BezierCurveType.NORMAL : BezierCurveType.HIDDEN;

                this.renderBezierCurves(track, curveType, ...branches);
              });

    Dispatcher.getInstance()
              .on(FYPEvent.TransitionsAnalyzed, ({ track, transitions }: FYPEventPayload['TransitionsAnalyzed']) => {
                this.renderChildSongCircles(track, transitions);
              });

    Dispatcher.getInstance()
              .on(FYPEvent.BeatBatchPlaying, ({
                nextAction,
                source,
                startPercentage,
                endPercentage,
                durationMs,
              }: FYPEventPayload['BeatBatchPlaying']) => {
                this.startSongCircleRotation(source, startPercentage, endPercentage, durationMs);

                if (!nextAction || nextAction instanceof BranchModel) {
                  this.updateNextBezierCurve(nextAction as BranchModel | null);
                }
              });

    Dispatcher.getInstance()
              .on(FYPEvent.BeatBatchStopped, ({ resetPercentage }: FYPEventPayload['BeatBatchStopped']) => {
                this.stopSongCircleRotation(resetPercentage);
              });

    Dispatcher.getInstance()
              .on(FYPEvent.PlayingTrackBranchAdded, ({ branch }: FYPEventPayload['PlayingTrackBranchAdded']) => {
                this.renderBezierCurves(branch.track, BezierCurveType.NORMAL, branch);
              });

    Dispatcher.getInstance()
              .on(FYPEvent.TrackChangeReady, ({ track }: FYPEventPayload['TrackChangeReady']) => {
                this.updateChildSongCircle(track, SongCircleType.NEXT_PARENT_READY);
              });

    Dispatcher.getInstance()
              .on(FYPEvent.TrackChanging, ({
                destinationTrack,
                transitionDurationMs,
                transitionOutStartMs,
                transitionOutDurationMs,
                transitionInStartMs,
                transitionInDurationMs,
              }: FYPEventPayload['TrackChanging']) => {
                this.transitionChildToParent(destinationTrack,
                                             transitionDurationMs,
                                             transitionOutStartMs,
                                             transitionOutDurationMs,
                                             transitionInStartMs,
                                             transitionInDurationMs);
              });

    Dispatcher.getInstance()
              .on(FYPEvent.TrackChanged, ({ track }: FYPEventPayload['TrackChanged']) => {
                this.updateParentSong(track);
              });
  }

  public handleMouseMove(mousePoint: WorldPoint) {
    const parentSongCircle = this.getParentSongCircle();
    if (!parentSongCircle) {
      return;
    }

    const percentageInSong = this.getMousePercentage(mousePoint, parentSongCircle);
    this.updateSeekingNeedle(mousePoint, percentageInSong, parentSongCircle);
  }

  public handleMouseClick(mousePoint: WorldPoint) {
    const parentSongCircle = this.getParentSongCircle();
    const isPointOutsideCircle = WorldPoint.isPointOutsideCircle(mousePoint, parentSongCircle);
    if (isPointOutsideCircle) {
      return;
    }

    const percentageInSong = this.getMousePercentage(mousePoint, parentSongCircle);
    Dispatcher.getInstance()
              .dispatch(FYPEvent.SeekRequested, {
                percentage: percentageInSong,
              });
  }

  private getMousePercentage(mousePoint: WorldPoint, songCircle: SongCircle): number {
    const percentage = conversions.pointToPercentage(songCircle.getCenter(), mousePoint);

    // Undo the rotationOffsetPercentage
    const percentageInSong = percentage + Rotation.rotationOffsetPercentage;

    return percentageInSong % 100; // TODO: Shouldn't have to modulo this...
  }

  public static getInstance(canvas?: HTMLCanvasElement): CanvasService {
    if (this._instance) {
      return this._instance;
    }

    return this._instance = new this(canvas);
  }

  private transitionChildToParent(
    destinationTrack: TrackModel,
    transitionDurationMs: number,
    transitionOutStartMs: number,
    transitionOutDurationMs: number,
    transitionInStartMs: number,
    transitionInDurationMs: number,
  ) {
    const getStartCameraLocationPointFn = () => this.getParentSongCircle()
                                                    .getAdjustedCenter()
                                                    .alignToCameraBase();
    const getEndCameraLocationPointFn = () => this.getSongCircle(destinationTrack)
                                                  .getAdjustedCenter()
                                                  .alignToCameraBase();

    this.scene.animateCamera(getStartCameraLocationPointFn,
                             getEndCameraLocationPointFn,
                             transitionDurationMs);

    const parentBezierCurves = this.getParentBezierCurves();
    const nextParentBezierCurves = this.getBezierCurves(destinationTrack);
    const parentSongCircle = this.getParentSongCircle();
    const nextParentSongCircle = this.getSongCircle(destinationTrack);
    const needles = Object.values(this._needles);

    const childSongCircles = Object.values(this._songCircles)
                                   .filter(({ track: childTrack }) => {
                                     return childTrack.ID !== this._playingTrackID &&
                                            childTrack.ID !== destinationTrack.ID;
                                   });

    drawableFactory.transitionChildToParent(parentSongCircle,
                                            nextParentSongCircle,
                                            childSongCircles,
                                            parentBezierCurves,
                                            nextParentBezierCurves,
                                            needles);

    // TODO: Things we have to do here:
    // 1. Render in the BezierCurves immediately in BranchesAnalyzed, but hide them
    // 2. Wait until transitionOutStartMs, Updatable.fadeOut() (on SC and bezier curves) for transitionOutDurationMs
    // 3. Wait until transitionInStartMs, Updatable.fadeIn() (on SC and bezier curves) for transitionInDurationMs
    // 4. Change the playingTrackID etc when animateCamera is finished
  }

  private updateParentSong({ ID }: TrackModel) {
    this._playingTrackID = ID;
  }

  private renderParentSongCircle(track: TrackModel) {
    const songCircle = drawableFactory.renderParentSongCircle(this.scene, track);
    const playingNeedle = drawableFactory.renderNeedle(this.scene, songCircle, NeedleType.PLAYING, 0);

    Updatable.animate(AnimationType.FADE_IN, songCircle, playingNeedle);

    this._songCircles[track.ID] = songCircle;
    this._needles[NeedleType.PLAYING] = playingNeedle;

    this.updateParentSong(track);

    setTimeout(() => {
      this.loadingAnimation();
    }, 1500);
  }

  public renderBezierCurves(track: TrackModel, type: BezierCurveType, ...branches: BranchModel[]) {
    const songCircle = this.getSongCircle(track);
    const bezierCurves = drawableFactory.renderBezierCurves(this.scene, songCircle, type, branches);

    if (type === BezierCurveType.NORMAL) {
      Updatable.animate(AnimationType.FADE_IN, ...bezierCurves);
    }

    this._bezierCurves[track.ID] = bezierCurves;
  }

  private renderChildSongCircles(originTrack: TrackModel, transitions: SongTransitionModel[]) {
    const parentSongCircle = this.getSongCircle(originTrack);

    transitions.forEach(({ destinationTrack, transitionOutMiddleBeat }) => {
      const percentage = transitionOutMiddleBeat.getPercentageInTrack(originTrack.duration);
      const childSongCircle = drawableFactory.renderChildSongCircle(this.scene,
                                                                    parentSongCircle,
                                                                    destinationTrack,
                                                                    percentage);

      // Stagger in childSongCircle loading for effect
      const animationDelay = math.getRandomInteger(config.drawables.songCircle.childMinAnimationDelayMs,
                                                   config.drawables.songCircle.childMaxAnimationDelayMs);
      setTimeout(() => {
        Updatable.animate(AnimationType.FADE_IN, childSongCircle);
      }, animationDelay);

      this._songCircles[destinationTrack.ID] = childSongCircle;
    });
  }

  /**
   * Adds highlighting to the next branch, removes highlighting for all
   * other branches
   *
   * @param eventPayload The next branch to be taken
   */
  public updateNextBezierCurve(nextBranch: BranchModel) {
    if (!nextBranch) {
      const bezierCurves = this.getParentBezierCurves();

      drawableFactory.updateNextBezierCurve(bezierCurves, null);
      return;
    }

    const bezierCurves = this.getBezierCurves(nextBranch.track);
    const nextBezierCurve = bezierCurves.find(({ branch }) => {
      return BranchModel.isSameBranch(branch, nextBranch as BranchModel);
    }) || null;

    drawableFactory.updateNextBezierCurve(bezierCurves, nextBezierCurve);
  }

  public setSongCircleRotation(percentage: number) {
    this.scene.setRotationPercentage(percentage);
  }

  public startSongCircleRotation(
    source: NeedleType,
    startPercentage: number,
    endPercentage: number,
    durationMs: number,
  ) {
    this._isAnimating = true;

    const isBranchNavPreviewing = source === NeedleType.BRANCH_NAV;

    this.scene.animateRotation(
      startPercentage,
      endPercentage,
      durationMs,
      (rotationPercentage: number) => {
        if (!this._isAnimating) {
          return false;
        }

        if (!this.isBranchNavOpen() || isBranchNavPreviewing) {
          this.setSongCircleRotation(rotationPercentage);
        }

        this.updateNeedle(NeedleType.PLAYING, rotationPercentage);

        return true;
      },
    );
  }

  public stopSongCircleRotation(resetPercentage: number) {
    this._isAnimating = false;

    if (resetPercentage !== null) {
      this.setSongCircleRotation(resetPercentage);
      this.updateNeedle(NeedleType.PLAYING, resetPercentage);
    }
  }

  public previewBezierCurve(
    type: BezierCurveType,
    earliestPercentage: number | null,
    latestPercentage: number | null = earliestPercentage,
  ) {
    if (this.isBranchNavOpen()) {
      drawableFactory.updateBezierCurve(this._branchNavBezierCurve, type, earliestPercentage, latestPercentage);
      return;
    }

    const parentSongCircle = this.getParentSongCircle();
    this._needles[NeedleType.BRANCH_NAV] = drawableFactory.renderNeedle(this.scene,
                                                                        parentSongCircle,
                                                                        NeedleType.BRANCH_NAV,
                                                                        0);
    this._branchNavBezierCurve = drawableFactory.renderBezierCurveFromPercentages(this.scene,
                                                                                  parentSongCircle,
                                                                                  BezierCurveType.SCAFFOLD,
                                                                                  earliestPercentage,
                                                                                  latestPercentage);
  }

  public removePreviewBezierCurve() {
    if (!this.isBranchNavOpen()) {
      return;
    }

    this.scene.remove(this._branchNavBezierCurve, this._needles[NeedleType.BRANCH_NAV]);
    this._branchNavBezierCurve = null;
  }

  public updateNeedle(needleType: NeedleType, percentage: number) {
    const needle = this._needles[needleType];

    if (!needle) {
      throw new Error('Needle has not been rendered yet!');
    }

    drawableFactory.updateNeedle(needle, percentage);
  }

  private updateSeekingNeedle(mousePoint: WorldPoint, percentageInSong: number, songCircle: SongCircle) {
    const isOutsideCircle = WorldPoint.isPointOutsideCircle(mousePoint, songCircle);
    const seekingNeedle = this._needles[NeedleType.SEEKING];

    if (isOutsideCircle) {
      if (!seekingNeedle) {
        return;
      }

      seekingNeedle.type = NeedleType.HIDDEN;
    } else {
      if (!seekingNeedle) {
        this._needles[NeedleType.SEEKING] = drawableFactory.renderNeedle(this.scene,
                                                                         songCircle,
                                                                         NeedleType.SEEKING,
                                                                         percentageInSong);
      } else {
        seekingNeedle.type = NeedleType.SEEKING;
        seekingNeedle.percentage = percentageInSong;
      }
    }
  }

  private updateChildSongCircle(track: TrackModel, type: SongCircleType) {
    const childSongCircle = this.getSongCircle(track);

    drawableFactory.updateSongCircleType(childSongCircle, type);
  }

  private isBranchNavOpen(): boolean {
    return this._branchNavBezierCurve !== null;
  }

  private getSongCircle({ ID }: TrackModel): SongCircle {
    return this._songCircles[ID];
  }

  private getParentSongCircle(): SongCircle {
    return this._songCircles[this._playingTrackID];
  }

  private getParentBezierCurves(): BezierCurve[] {
    return this._bezierCurves[this._playingTrackID];
  }

  private getBezierCurves({ ID }: TrackModel | null): BezierCurve[] {
    return this._bezierCurves[ID];
  }

  private loadingAnimation() {
    const defaultCameraLocationPoint = WorldPoint.getOrigin().translate(0, 0, -5);
    const startCameraLocationPointFn = () => defaultCameraLocationPoint;
    const endCameraLocationPointFn = () => WorldPoint.getOrigin().alignToCameraBase();
    const animationCurve = config.scene.animationCurves[AnimationCurve.EASE_IN];

    this.scene.animateCamera(startCameraLocationPointFn,
                             endCameraLocationPointFn,
                             500,
                             animationCurve);
  }
}

export default CanvasService;
