import Scene from './Scene';
import SongCircle from './SongCircle';
import BranchModel from '../../../models/branches/Branch';
import Updatable from './Updatable';
import * as THREE from 'three';
import WorldPoint from './utils/WorldPoint';
import Rotation from './utils/Rotation';
const MeshLine = require('three.meshline');

type MeshLineOptions = {
  lineWidth: number;
  color: number;
};

/**
 * A BezierCurve in this app is a branch: starting from one point on
 * the circle, approaching the center, and ending at another point on
 * the circle
 */
class BezierCurve extends Updatable {
  private static LINE_WIDTH: number = 30;
  private static COLOUR: number = 0xD9D9D9;
  private static RENDER_ORDER: number = 0;

  // The next bezier curve is the one that will be taken next in the song.
  // It should be highlighted in some way to convey that.
  private _isNext: boolean = false;
  private static NEXT_COLOUR: number = SongCircle.EDGE_COLOUR;
  private static NEXT_RENDER_ORDER: number = BezierCurve.RENDER_ORDER + 1;

  constructor(
    scene: Scene,
    private songCircle: SongCircle,
    public branch: BranchModel,
    fromPercentage: number,
    toPercentage: number,
  ) {
    super();

    const meshLineOptions = this.getMeshLineOptions();
    this.addBezierCurve(songCircle, fromPercentage, toPercentage, meshLineOptions);

    super.addAll(scene);
  }

  private addBezierCurve(
    songCircle: SongCircle,
    fromPercentage: number,
    toPercentage: number,
    meshLineOptions: MeshLineOptions,
  ) {
    const centerPoint = songCircle.center;
    const fromPoint = WorldPoint.getPointOnCircleFromPercentage(songCircle, fromPercentage);
    const toPoint = WorldPoint.getPointOnCircleFromPercentage(songCircle, toPercentage);

    const curve = new THREE.CubicBezierCurve(
      new THREE.Vector2(fromPoint.x,   fromPoint.y),
      new THREE.Vector2(centerPoint.x, centerPoint.y),
      new THREE.Vector2(centerPoint.x, centerPoint.y),
      new THREE.Vector2(toPoint.x,     toPoint.y),
    );
    const points = curve.getPoints(50);
    const geometry = new THREE.Geometry().setFromPoints(points);
    const line = new MeshLine.MeshLine();
    line.setGeometry(geometry);

    const material = new MeshLine.MeshLineMaterial({
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
      sizeAttenuation: 0,
      near: Scene.CAMERA_Z_CLIP_NEAR,
      far: Scene.CAMERA_Z_CLIP_FAR,
      ...meshLineOptions,
    });

    super.createAndAddMesh({
      material,
      geometry: line.geometry,
      rotation: Rotation.getRotationFromPercentage(0),
      renderOrder: 0,
    });
  }

  public set isNext(isNext: boolean) {
    if (isNext !== this._isNext) {
      this._isNext = isNext;

      // Trigger a re-render of this element to make it appear ontop of other bezier curves
      super.refreshChildren();
    }
  }

  private getMeshLineOptions(): MeshLineOptions {
    const color = this._isNext ? BezierCurve.NEXT_COLOUR : BezierCurve.COLOUR;

    return {
      color,
      lineWidth: BezierCurve.LINE_WIDTH,
    };
  }

  public get center(): WorldPoint {
    const { x, y, z } = this.songCircle.center;
    const position = WorldPoint.getPoint(x, y, z);

    return position;
  }

  protected get rotation(): Rotation {
    const rotation = Rotation.getRotationFromPercentage(0);

    return rotation;
  }

  protected getRenderOrder() {
    return this._isNext ? BezierCurve.NEXT_RENDER_ORDER : BezierCurve.RENDER_ORDER;
  }

  public update() {
    const group = super.getMesh();
    const [bezierCurveMesh] = group.children as THREE.Mesh[];
    const material = bezierCurveMesh.material as THREE.MeshBasicMaterial;
    const geometry = bezierCurveMesh.geometry as THREE.Geometry;
    const { color } = this.getMeshLineOptions();

    // Update the bezier curve colours (next branch being highlighted)
    material.color.setHex(color);
    geometry.colorsNeedUpdate = true;

    super.update();
  }
}

export default BezierCurve;
