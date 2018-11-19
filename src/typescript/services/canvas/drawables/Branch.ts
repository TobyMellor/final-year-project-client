import Scene from './Scene';
import SongCircle from './SongCircle';
import WorldPoint from './points/WorldPoint';

class Branch {
  private scene: Scene;
  private songCircle: SongCircle;
  private fromPercentage: number;
  private toPercentage: number;
  private lineWidth: number;

  constructor(
    scene: Scene,
    songCircle: SongCircle,
    fromPercentage: number,
    toPercentage: number,
    lineWidth: number,
  ) {
    this.scene = scene;
    this.fromPercentage = fromPercentage;
    this.toPercentage = toPercentage;
    this.lineWidth = lineWidth;

    this.renderBezierCurve(scene, songCircle, fromPercentage, toPercentage, lineWidth);
  }

  private renderBezierCurve(
    scene: Scene,
    songCircle: SongCircle,
    fromPercentage: number,
    toPercentage: number,
    lineWidth: number,
  ) {
    const THREE = Scene.THREE;

    // TODO: Probably a problem with the Z... is it being set by SongCircle.ts?
    const fromPoint = WorldPoint.getPointOnCircleFromPercentage(songCircle,
                                                                fromPercentage);
    const centerPoint = songCircle.getCenter();
    const toPoint = WorldPoint.getPointOnCircleFromPercentage(songCircle,
                                                              toPercentage);
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(fromPoint.x,   fromPoint.y,   centerPoint.z),
      new THREE.Vector3(centerPoint.x, centerPoint.y, centerPoint.z),
      new THREE.Vector3(centerPoint.x, centerPoint.y, centerPoint.z),
      new THREE.Vector3(toPoint.x,   toPoint.y,   centerPoint.z),
    );

    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({ color : 0xff0000 });

    // Create the final object to add to the scene
    const bezierCurve = new THREE.Line(geometry, material);

    scene.add(bezierCurve);
  }
}

export default Branch;
