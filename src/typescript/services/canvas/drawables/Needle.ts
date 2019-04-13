import Scene from './Scene';
import SongCircle from './SongCircle';
import Updatable from './Updatable';
import * as THREE from 'three';
import WorldPoint from './utils/WorldPoint';
import Rotation from './utils/Rotation';
import { NeedleType } from '../../../types/enums';
import config from '../../../config';

type Input = {
  scene: Scene;
  songCircle: SongCircle;
  needleType: NeedleType;
  percentage: number;
};

class Needle extends Updatable {
  private _songCircle: SongCircle;
  public needleType: NeedleType;
  private _percentage: number;

  constructor({
    scene,
    songCircle,
    needleType,
    percentage,
  }: Input) {
    super();

    this._songCircle = songCircle;
    this.needleType = needleType;
    this._percentage = percentage;

    this.addNeedle(songCircle, needleType, percentage);

    super.addAll(scene);
  }

  private addNeedle(songCircle: SongCircle, needleType: NeedleType, percentage: number) {
    const [height, width] = this.getHeightAndWidth(songCircle);
    const geometry = new THREE.PlaneGeometry(height, width);

    const color = this.getColor(needleType);
    const material = new THREE.MeshLambertMaterial({ color });

    const position = WorldPoint.getOrigin()
                               .translate(height / 2, 0);

    super.createAndAddMesh({
      geometry,
      material,
      position,
      renderOrder: 0,
      shouldInversePercentage: true,
    });
  }

  private getColor(needleType: NeedleType): number {
    switch (needleType) {
      case NeedleType.PLAYING:
        return 0xE74C3C;
      case NeedleType.BRANCH_NAV:
        return 0xF1C40F;
      default:
        throw new Error('Unknown NeedleType');
    }
  }

  private getHeightAndWidth(songCircle: SongCircle): [number, number] {
    const songCircleLineWidth = songCircle.initialLineWidth;
    const height = songCircleLineWidth * config.drawables.needle.relativeHeight;
    const width = songCircleLineWidth * config.drawables.needle.relativeWidth;

    return [height, width];
  }

  protected get center() {
    const position = WorldPoint.getPointOnCircleFromPercentage(this._songCircle, this._percentage);

    return position.alignToSceneBase();
  }

  protected get rotation() {
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
