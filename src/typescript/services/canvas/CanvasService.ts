import Dispatcher from '../../events/Dispatcher';
import Scene from '../canvas/drawables/Scene';
import * as drawableFactory from '../../factories/drawable';
import { FYPEvent, NeedleType, BezierCurveType, AnimationType, SongCircleType } from '../../types/enums';
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

class CanvasService {
  private static _instance: CanvasService = null;

  public scene: Scene = null;
  private _playingTrackID: string;
  private _songCircles: { [trackID: string]: SongCircle } = {};
  private _bezierCurves: { [trackID: string]: BezierCurve[] } = {};
  private _playingNeedle: Needle | null = null;
  private _branchNavNeedle: Needle | null = null;
  private _branchNavBezierCurve: BezierCurve | null = null;
  private _isAnimating = false;

  private constructor(canvas: HTMLCanvasElement) {
    this.scene = Scene.getInstance(canvas);

    Dispatcher.getInstance()
              .on(FYPEvent.TrackChangeRequested, ({ track }) => {
                if (!this._playingTrackID) {
                  this.renderParentSongCircle(track);
                } else {
                  this.updateChildSongCircle(track, SongCircleType.NEXT_PARENT_LOADING);
                }
              });

    Dispatcher.getInstance()
              .on(FYPEvent.BranchesAnalyzed, ({ track, branches }) => {
                this.renderBezierCurves(track, BezierCurveType.NORMAL, ...branches);
              });

    Dispatcher.getInstance()
              .on(FYPEvent.TransitionsAnalyzed, ({ track, transitions }) => {
                this.renderChildSongCircles(track, transitions);
              });

    Dispatcher.getInstance()
              .on(FYPEvent.BeatBatchPlaying, (data) => {
                if (data.action instanceof SongTransitionModel) {
                  // this.transitionChildToParent(data);
                } else {
                  this.updateNextBezierCurve(data);
                  this.startSongCircleRotation(data);
                }
              });

    Dispatcher.getInstance()
              .on(FYPEvent.BeatBatchStopped, data => this.stopSongCircleRotation(data));

    Dispatcher.getInstance()
              .on(FYPEvent.PlayingTrackBranchAdded, ({ branch }) => {
                this.renderBezierCurves(branch.track, BezierCurveType.NORMAL, branch);
              });

    Dispatcher.getInstance()
              .on(FYPEvent.TrackChangeReady, ({ track }) => {
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
              }) => {
                this.transitionChildToParent(destinationTrack,
                                             transitionDurationMs,
                                             transitionOutStartMs,
                                             transitionOutDurationMs,
                                             transitionInStartMs,
                                             transitionInDurationMs);
              });
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
    const getStartCameraFocusPointFn = () => this.getParentSongCircle().getAdjustedCenter();
    const getStartCameraLocationPointFn = () => getStartCameraFocusPointFn().alignToCameraBase();
    const getEndCameraFocusPointFn = () => this.getSongCircle(destinationTrack).getAdjustedCenter();
    const getEndCameraLocationPointFn = () => getEndCameraFocusPointFn().alignToCameraBase();

    this.scene.animateCamera(getStartCameraLocationPointFn,
                             getStartCameraFocusPointFn,
                             getEndCameraLocationPointFn,
                             getEndCameraFocusPointFn,
                             transitionDurationMs);

    const parentBezierCurves = this.getParentBezierCurves();
    const nextParentBezierCurves = this.getBezierCurves(destinationTrack);
    const parentSongCircle = this.getParentSongCircle();
    const nextParentSongCircle = this.getSongCircle(destinationTrack);

    const childSongCircles = Object.values(this._songCircles)
                                   .filter(({ track: childTrack }) => {
                                     return childTrack.ID !== this._playingTrackID &&
                                            childTrack.ID !== destinationTrack.ID;
                                   });

    drawableFactory.transitionChildToParent(parentSongCircle,
                                            nextParentSongCircle,
                                            childSongCircles,
                                            parentBezierCurves,
                                            nextParentBezierCurves);

    // TODO: Switch playingTrackID

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
    this._playingNeedle = playingNeedle;

    this.updateParentSong(track);
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

    transitions.forEach(({ destinationTrack, transitionMiddleBeat }) => {
      const percentage = transitionMiddleBeat.getPercentageInTrack(originTrack.duration);
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
  public updateNextBezierCurve({ nextAction: nextBranch }: FYPEventPayload['BeatBatchPlaying']) {
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

  public startSongCircleRotation({
    source,
    startPercentage,
    endPercentage,
    durationMs,
  }: FYPEventPayload['BeatBatchPlaying']) {
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

  public stopSongCircleRotation({ resetPercentage }: FYPEventPayload['BeatBatchStopped']) {
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
    this._branchNavNeedle = drawableFactory.renderNeedle(this.scene, parentSongCircle, NeedleType.BRANCH_NAV, 0);
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

    this.scene.remove(this._branchNavBezierCurve, this._branchNavNeedle);
    this._branchNavBezierCurve = null;
  }

  public updateNeedle(needleType: NeedleType, percentage: number) {
    const needle = needleType === NeedleType.PLAYING ? this._playingNeedle : this._branchNavNeedle;

    if (!needle) {
      throw new Error('Needle has not been rendered yet!');
    }

    drawableFactory.updateNeedle(needle, percentage);
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
}

export default CanvasService;
