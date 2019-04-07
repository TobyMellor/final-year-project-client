import config from '../../../config';
import Scene from './Scene';
import SongCircle from './SongCircle';
import BranchModel from '../../../models/branches/Branch';
import Updatable from './Updatable';
import * as THREE from 'three';
import WorldPoint from './utils/WorldPoint';
import Rotation from './utils/Rotation';
const MeshLine = require('three.meshline');

export enum NeedleType {
  PLAYING = 'playing',
  PREVIEWING = 'previewing',
}

class Needle extends Updatable {
  private static RELATIVE_WIDTH: number = 0.25;
  private static RELATIVE_HEIGHT: number = 4;

  constructor(
    scene: Scene,
    private _songCircle: SongCircle,
    needleType: NeedleType,
    private _percentage: number,
  ) {
    super();

    this.addNeedle(_songCircle, needleType, _percentage);

    super.addAll(scene);
  }

  private addNeedle(songCircle: SongCircle, needleType: NeedleType, percentage: number) {
    const [height, width] = this.getHeightAndWidth(songCircle);
    const geometry = new THREE.PlaneGeometry(height, width);

    const color = this.getColor(needleType);
    const material = new THREE.MeshBasicMaterial({ color });

    const position = WorldPoint.getOrigin()
                               .translate(height / 2, 0);

    super.createAndAddMesh({
      geometry,
      material,
      position,
      renderOrder: 0,
    });
  }

  private getColor(needleType: NeedleType): number {
    switch (needleType) {
      case NeedleType.PLAYING:
        return 0xE74C3C;
      case NeedleType.PREVIEWING:
        return 0xF1C40F;
      default:
        throw new Error('Unknown NeedleType');
    }
  }

  private getHeightAndWidth(songCircle: SongCircle): [number, number] {
    const songCircleLineWidth = songCircle.lineWidth;
    const height = songCircleLineWidth * Needle.RELATIVE_HEIGHT;
    const width = songCircleLineWidth * Needle.RELATIVE_WIDTH;

    return [height, width];
  }

  public get center() {
    const position = WorldPoint.getPointOnCircleFromPercentage(this._songCircle, this._percentage);

    return position.alignToSceneBase();
  }

  public get rotation() {
    return Rotation.getRotationFromPercentage(this._percentage);
  }

  protected getRenderOrder() {
    return 10;
  }

  public set percentage(percentage: number) {
    this._percentage = percentage;
  }
}

export default Needle;
