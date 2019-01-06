import Scene from './Scene';
import SongCircle from './SongCircle';
import BranchModel from '../../../models/branches/Branch';
import Updatable from './Updatable';
import * as THREE from 'three';
import WorldPoint from './utils/WorldPoint';
import Rotation from './utils/Rotation';

class BezierCurve extends Updatable {
  constructor(
    scene: Scene,
    private songCircle: SongCircle,
    public branch: BranchModel,
    fromPercentage: number,
    toPercentage: number,
    lineWidth: number,
  ) {
    super();

    this.addBezierCurve(songCircle, fromPercentage, toPercentage, lineWidth);

    super.addAll(scene);
  }

  private addBezierCurve(
    songCircle: SongCircle,
    fromPercentage: number,
    toPercentage: number,
    lineWidth: number,
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
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x2F3640 });
    const bezierCurve = new THREE.Line(geometry, material);

    super.addMesh({ mesh: bezierCurve, rotation: Rotation.getRotationFromPercentage(0) });
  }

  public get center(): WorldPoint {
    const { x, y, z } = this.songCircle.center;
    const position = WorldPoint.getPoint(x, y, z + 0.0001);

    return position;
  }

  protected get rotation(): Rotation {
    const rotation = Rotation.getRotationFromPercentage(0);

    return rotation;
  }
}

export default BezierCurve;
