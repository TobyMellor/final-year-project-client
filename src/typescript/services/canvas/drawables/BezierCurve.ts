import Scene from './Scene';
import SongCircle from './SongCircle';
import WorldPoint from './points/WorldPoint';
import BranchModel from '../../../models/branches/Branch';
import Updatable, { NamedMesh } from './Updatable';

class BezierCurve extends Updatable {
  protected _namedMeshes: [NamedMesh] = [null];

  constructor(
    private scene: Scene,
    private songCircle: SongCircle,
    public branch: BranchModel,
    private fromPercentage: number,
    private toPercentage: number,
    private lineWidth: number,
  ) {
    super();

    this.renderBezierCurve(scene, songCircle, fromPercentage, toPercentage, lineWidth);

    scene.add(this);
  }

  private renderBezierCurve(
    scene: Scene,
    songCircle: SongCircle,
    fromPercentage: number,
    toPercentage: number,
    lineWidth: number,
  ) {
    const THREE = Scene.THREE;

    const fromPoint = WorldPoint.getPointOnCircleFromPercentage(songCircle,
                                                                fromPercentage);
    const centerPoint = songCircle.center;
    const toPoint = WorldPoint.getPointOnCircleFromPercentage(songCircle,
                                                              toPercentage);

    const curve = new THREE.CubicBezierCurve(
      new THREE.Vector2(fromPoint.x / 2,   fromPoint.y / 2),
      new THREE.Vector2(centerPoint.x,     centerPoint.y),
      new THREE.Vector2(centerPoint.x,     centerPoint.y),
      new THREE.Vector2(toPoint.x / 2,     toPoint.y / 2),
    );

    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({ color : 0x2F3640 });

    // Create the final object to add to the scene
    const bezierCurve = super.createNamedMesh(geometry, material);
    bezierCurve.mesh.position.set(0, 0, centerPoint.z + 0.0001);

    return bezierCurve;
  }

  public updatePosition() {
    //
  }
}

export default BezierCurve;
