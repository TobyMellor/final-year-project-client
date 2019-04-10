import Dispatcher from '../../events/Dispatcher';
import Scene from '../canvas/drawables/Scene';
import * as drawableFactory from '../../factories/drawable';
import { FYPEvent, NeedleType, BezierCurveType } from '../../types/enums';
import { FYPEventPayload } from '../../types/general';
import BezierCurve from './drawables/BezierCurve';
import BranchModel from '../../models/branches/Branch';
import SongCircle from './drawables/SongCircle';
import Needle from './drawables/Needle';
import * as math from '../../utils/math';
import TrackModel from '../../models/audio-analysis/Track';
import SongTransitionModel from '../../models/SongTransition';

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
              .on(FYPEvent.TrackChangeRequested, (data) => {
                // Only listen to this event once
                if (!this._playingTrackID) {
                  this.renderParentSongCircle(data);
                }
              });

    Dispatcher.getInstance()
              .on(FYPEvent.BranchesAnalyzed, ({ track, branches }) => this.renderBezierCurves(track, ...branches));

    Dispatcher.getInstance()
              .on(FYPEvent.TransitionsAnalyzed, data => this.renderChildSongCircles(data));

    Dispatcher.getInstance()
              .on(FYPEvent.BeatBatchPlaying, (data) => {
                if (data.action instanceof SongTransitionModel) {
                  this.transitionChildToParent(data);
                } else {
                  this.updateNextBezierCurve(data);
                  this.startSongCircleRotation(data);
                }
              });

    Dispatcher.getInstance()
              .on(FYPEvent.BeatBatchStopped, data => this.stopSongCircleRotation(data));

    Dispatcher.getInstance()
              .on(FYPEvent.PlayingTrackBranchAdded, ({ branch }) => this.renderBezierCurves(branch.track, branch));
  }

  public static getInstance(canvas?: HTMLCanvasElement): CanvasService {
    if (this._instance) {
      return this._instance;
    }

    return this._instance = new this(canvas);
  }

  private transitionChildToParent({ track }: FYPEventPayload['TrackChanged']) {
    // TODO: Implement
  }

  private renderParentSongCircle({ track }: FYPEventPayload['TrackChangeRequested']) {
    const songCircle = drawableFactory.renderParentSongCircle(this.scene, track);
    const playingNeedle = drawableFactory.renderNeedle(this.scene, songCircle, NeedleType.PLAYING, 0);

    const trackID = track.ID;
    this._playingTrackID = trackID;
    this._songCircles[trackID] = songCircle;
    this._playingNeedle = playingNeedle;
  }

  public renderBezierCurves(track: TrackModel, ...branches: BranchModel[]) {
    const songCircle = this.getSongCircle(track);
    const bezierCurves = drawableFactory.renderBezierCurves(this.scene, songCircle, branches);

    this._bezierCurves[track.ID] = bezierCurves;
  }

  private renderChildSongCircles({ track: originTrack, transitions }: FYPEventPayload['TransitionsAnalyzed']) {
    const parentSongCircle = this.getSongCircle(originTrack);

    transitions.forEach(({ destinationTrack, transitionMiddleBeat }) => {
      const percentage = transitionMiddleBeat.getPercentageInTrack(originTrack.duration);
      console.log("percent", percentage, destinationTrack, transitionMiddleBeat);
      const childSongCircle = drawableFactory.renderChildSongCircle(this.scene,
                                                                    parentSongCircle,
                                                                    destinationTrack,
                                                                    percentage);

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
