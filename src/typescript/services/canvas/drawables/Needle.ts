import Scene from './Scene';
import SongCircle from './SongCircle';
import Updatable, { MeshAnimationOptions } from './Updatable';
import * as THREE from 'three';
import WorldPoint from './utils/WorldPoint';
import Rotation from './utils/Rotation';
import { NeedleType, AnimationType } from '../../../types/enums';
import config from '../../../config';
import * as conversions from '../../../utils/conversions';
import * as animations from '../../../utils/animations';

type Input = {
  scene: Scene;
  songCircle: SongCircle;
  type: NeedleType;
  percentage: number;
};

class Needle extends Updatable {
  private _songCircle: SongCircle;
  private _type: NeedleType;
  private _percentage: number;

  constructor({
    scene,
    songCircle,
    type,
    percentage,
  }: Input) {
    super();

    this._songCircle = songCircle;
    this._type = type;
    this._percentage = percentage;

    this.addNeedle(songCircle, type, percentage);

    super.addAll(scene);
  }

  private addNeedle(songCircle: SongCircle, type: NeedleType, percentage: number) {
    const [height, width] = this.getHeightAndWidth(songCircle);
    const geometry = new THREE.PlaneGeometry(height, width);
    const material = new THREE.MeshLambertMaterial({ color: config.drawables.needle.colour[type] });

    const position = WorldPoint.getOrigin()
                               .translate(height / 2, 0);

    super.createAndAddMesh({
      geometry,
      material,
      position,
      renderOrder: 1000,
      shouldInversePercentage: true,
      canChangeType: true,
      shouldKeepVisible: this._type === NeedleType.BRANCH_NAV,
      changeType: (options: MeshAnimationOptions) => {
        if (options.fromType === NeedleType.HIDDEN) {
          animations.defaultFadeIn(options);
        } else {
          animations.defaultFadeOut(options);
        }
      },
    });
  }

  private getHeightAndWidth(songCircle: SongCircle): [number, number] {
    const songCircleLineWidth = songCircle.lineWidth;
    const height = songCircleLineWidth * config.drawables.needle.relativeHeight;
    const width = songCircleLineWidth * config.drawables.needle.relativeWidth;

    return [height, width];
  }

  protected get center() {
    const position = WorldPoint.getPointOnSongCircleFromPercentage(this._songCircle.getCenter(),
                                                                   this._songCircle,
                                                                   this._percentage);

    return position.alignToSceneBase();
  }

  protected get rotation() {
    return Rotation.getRotationFromPercentage(this._percentage);
  }

  public set songCircle(songCircle: SongCircle) {
    this._songCircle = songCircle;
  }

  protected getRenderOrder() {
    let renderOrder = 1000000;

    // Order of precedence: PLAYING -> BRANCH_NAV -> SEEKING -> HIDDEN
    switch (this._type) {
      case NeedleType.PLAYING:
        renderOrder += 1;
      case NeedleType.BRANCH_NAV:
        renderOrder += 1;
      case NeedleType.SEEKING:
        renderOrder += 1;
    }

    return renderOrder;
  }

  public set percentage(percentage: number) {
    this._percentage = percentage;
  }

  public set type(type: NeedleType) {
    if (this._type !== type) {
      super.animateWithOptions(AnimationType.CHANGE_TYPE, {
        fromType: this._type,
        toType: type,
      });

      this._type = type;
    }
  }
}

export default Needle;
