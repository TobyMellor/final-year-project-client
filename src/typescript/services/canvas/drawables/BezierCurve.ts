import config from '../../../config';
import Scene from './Scene';
import SongCircle from './SongCircle';
import BranchModel from '../../../models/branches/Branch';
import Updatable, { AnimatableMesh } from './Updatable';
import * as THREE from 'three';
import WorldPoint from './utils/WorldPoint';
import Rotation from './utils/Rotation';
import { BezierCurveType } from '../../../types/enums';
import * as conversions from '../../../utils/conversions';
const MeshLine = require('three.meshline');

type MeshLineOptions = {
  lineWidth: number;
  color: number;
  dashOffset?: number;
  dashArray?: number;
  dashRatio?: number;
};

type Input = {
  scene: Scene;
  songCircle: SongCircle;
  type: BezierCurveType;
  fromPercentage: number;
  toPercentage: number;
  branch: BranchModel | null;
};

/**
 * A BezierCurve in this app is a branch: starting from one point on
 * the circle, approaching the center, and ending at another point on
 * the circle
 */
class BezierCurve extends Updatable {
  private _curve: THREE.CubicBezierCurve3 = null;
  private _positionNeedsUpdate: boolean = false;

  private _type: BezierCurveType;
  private _songCircle: SongCircle;
  private _fromPercentage: number;
  private _toPercentage: number;
  public branch: BranchModel | null; // Not present if it's a previewing Branch

  constructor({
    scene,
    type,
    songCircle,
    fromPercentage,
    toPercentage,
    branch,
  }: Input) {
    super();

    this._songCircle = songCircle;
    this._type = type;
    this._fromPercentage = fromPercentage;
    this._toPercentage = toPercentage;
    this.branch = branch;

    const meshLineOptions = this.getMeshLineOptions(type, fromPercentage, toPercentage);
    this.addBezierCurve(type, songCircle, fromPercentage, toPercentage, meshLineOptions);

    super.addAll(scene);
  }

  private addBezierCurve(
    type: BezierCurveType,
    songCircle: SongCircle,
    fromPercentage: number,
    toPercentage: number,
    meshLineOptions: MeshLineOptions,
  ) {
    // A series of vector points along the curve
    const points = this.getBezierCurvePoints(songCircle, fromPercentage, toPercentage);
    const geometry = new THREE.Geometry().setFromPoints(points);
    const line = new MeshLine.MeshLine();
    line.setGeometry(geometry);

    const material = new MeshLine.MeshLineMaterial({
      resolution: new THREE.Vector3(window.innerWidth, window.innerHeight, 10),
      sizeAttenuation: 0,
      near: Scene.CAMERA_Z_CLIP_NEAR,
      far: Scene.CAMERA_Z_CLIP_FAR,
      ...meshLineOptions,
    });

    super.createAndAddMesh({
      material,
      geometry: line.geometry,
      renderOrder: 0,
      rotation: Rotation.getRotationFromPercentage(0).rotateAndFlip(180), // Fix the previewing bezier to position
      shouldKeepVisible: type === BezierCurveType.SCAFFOLD || type === BezierCurveType.PREVIEW,
    });
  }

  private getBezierCurvePoints(
    songCircle: SongCircle,
    fromPercentage: number,
    toPercentage: number,
  ): THREE.Vector3[] {
    // The 4 control points (center is used twice)
    // If a 0 percentage is given, it will be anchored to the bottom of the SongCircle
    const centerPoint = songCircle.center;
    const fromPoint = WorldPoint.getPointOnCircleFromPercentage(songCircle, fromPercentage);
    const toPoint = WorldPoint.getPointOnCircleFromPercentage(songCircle, toPercentage);

    // From point is largest, to point is smallest

    let curve = this._curve;
    if (!curve) {
      curve = this._curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(fromPoint.x, fromPoint.y),
        new THREE.Vector3(centerPoint.x, centerPoint.y),
        new THREE.Vector3(centerPoint.x, centerPoint.y),
        new THREE.Vector3(toPoint.x, toPoint.y),
      );
    } else {
      curve.v0.x = fromPoint.x;
      curve.v0.y = fromPoint.y;
      curve.v3.x = toPoint.x;
      curve.v3.y = toPoint.y;
    }

    return curve.getPoints(config.canvas.bezierCurve.points);
  }

  public set type(type: BezierCurveType) {
    if (type !== this._type) {
      const [startR, startG, startB] = conversions.decimalToRgb(config.drawables.bezierCurve.colour[this._type]);
      const [endR, endG, endB] = conversions.decimalToRgb(config.drawables.bezierCurve.colour[type]);

      this._type = type;

      // Trigger a re-render of this element to make it appear ontop of other bezier curves
      super.refreshChildren();

      // Fade to the next colour
      super.animate(config.drawables.colourChangeDurationMs, (animationDecimal: number, [mesh]: AnimatableMesh[]) => {
        const material = mesh.material as THREE.MeshLambertMaterial;
        const geometry = mesh.geometry as THREE.Geometry;
        const currentR = startR + (endR - startR) * animationDecimal;
        const currentG = startG + (endG - startG) * animationDecimal;
        const currentB = startB + (endB - startB) * animationDecimal;
        const currentHEX = conversions.rgbToDecimal(currentR, currentG, currentB);

        material.color.setHex(currentHEX);
        geometry.colorsNeedUpdate = true;
      });
    }
  }

  public updatePercentages(fromPercentage: number, toPercentage: number) {
    if (fromPercentage !== this._fromPercentage || toPercentage !== this._toPercentage) {
      this._fromPercentage = fromPercentage;
      this._toPercentage = toPercentage;
      this._positionNeedsUpdate = true;
    }
  }

  private getMeshLineOptions(type: BezierCurveType, fromPercentage: number, toPercentage: number): MeshLineOptions {
    const getDashOptions = () => {
      if (type === BezierCurveType.SCAFFOLD && fromPercentage !== toPercentage) {
        const dashOffset = (fromPercentage + toPercentage) / 100;

        return {
          dashOffset,
          dashArray: config.drawables.bezierCurve.dashSize,
          dashRatio: config.drawables.bezierCurve.dashSpacing,
        };
      }

      return {};
    };

    return {
      ...getDashOptions(),
      color: config.drawables.bezierCurve.colour[type],
      lineWidth: config.drawables.bezierCurve.lineWidth,
    };
  }

  public get center(): WorldPoint {
    return this._songCircle.center;
  }

  protected get rotation(): Rotation {
    return Rotation.getRotationFromPercentage(0);
  }

  protected getRenderOrder() {
    let renderOrder = 0;

    // Order of precedence: PREVIEW -> SCAFFOLD -> NEXT -> NORMAL
    switch (this._type) {
      case BezierCurveType.PREVIEW:
        renderOrder += 1;
      case BezierCurveType.SCAFFOLD:
        renderOrder += 1;
      case BezierCurveType.NEXT:
        renderOrder += 1;
    }

    return renderOrder;
  }

  public update() {
    const group = super.getMesh();
    const [bezierCurveMesh] = group.children as THREE.Mesh[];
    const meshLineOptions = this.getMeshLineOptions(this._type, this._fromPercentage, this._toPercentage);

    if (this._positionNeedsUpdate) {
      this._positionNeedsUpdate = false;
      this.addBezierCurve(this._type, this._songCircle, this._fromPercentage, this._toPercentage, meshLineOptions);
      group.remove(bezierCurveMesh);
    }

    // TODO: If we could replace the above with this, it would be much
    //       more efficient (MeshLine package prevents us from doing this?)
    // Update the bezier curve's points with the new percentages
    // geometry.vertices = this.getBezierCurvePoints(this._songCircle, this._fromPercentage, this._toPercentage);
    // geometry.verticesNeedUpdate = true;

    super.update();
  }
}

export default BezierCurve;
