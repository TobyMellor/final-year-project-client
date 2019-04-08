import Updatable from './Updatable';
import * as THREE from 'three';
import { OrbitControls } from 'three-orbitcontrols-ts';
import WorldPoint from './utils/WorldPoint';
import Rotation from './utils/Rotation';
import * as conversions from '../../../utils/conversions';
import config from '../../../config';

export type Drawable = {
  meshes: THREE.Mesh[];
};

class Scene {
  private static _instance: Scene = null;

  public static Z_BASE_DISTANCE = -5;

  private static CAMERA_FOV_DEGREES: number = 45;
  public static CAMERA_Z_CLIP_NEAR: number = 0.1;
  public static CAMERA_Z_CLIP_FAR: number = 3000.0;

  private _scene: THREE.Scene = null;
  private _camera: THREE.Camera = null;
  private _renderer: THREE.WebGLRenderer = null;
  private _light: THREE.SpotLight = null;

  private _updatables: Set<Updatable> = new Set();

  // The last known NDC coordinates of the mouse
  private _panTargetX: number = 0;
  private _panTargetY: number = 0;

  // The current NDC coordinates of the pan, eventually will match _panTarget
  private _panActualX: number = 0;
  private _panActualY: number = 0;

  private constructor(whereToDraw: HTMLCanvasElement) {
    const scene = new THREE.Scene();
    const aspectRatio = this.getAspectRatio();
    const camera = new THREE.PerspectiveCamera(Scene.CAMERA_FOV_DEGREES,
                                               aspectRatio,
                                               Scene.CAMERA_Z_CLIP_NEAR,
                                               Scene.CAMERA_Z_CLIP_FAR);

    const renderer = new THREE.WebGLRenderer({
      canvas: whereToDraw,
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(config.drawables.background.colour.background);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // const light = new THREE.SpotLight(0xFFFFFF, 0.05, 50);
    // // light.position.set(0, 0, 500);
    // light.castShadow = true;
    // scene.add(light);

    this._scene = scene;
    this._camera = camera;
    this._renderer = renderer;
    // this._light = light;

    document.addEventListener('mousemove', (e: MouseEvent) => this.onMouseMove(e), false);

    // Starts the render loop
    requestAnimationFrame(() => this.render());
  }

  private onMouseMove({ clientX, clientY }: MouseEvent) {
    const [x, y] = conversions.canvasPointToNDC(clientX, clientY);

    this._panTargetX = x;
    this._panTargetY = y;
  }

  private getAspectRatio() {
    return window.innerWidth / window.innerHeight;
  }

  public static getInstance(whereToDraw: HTMLCanvasElement): Scene {
    if (this._instance) {
      return this._instance;
    }

    return this._instance = new this(whereToDraw);
  }

  public add(...updatables: Updatable[]) {
    updatables.forEach((updatable) => {
      const mesh = updatable.getMesh();

      this._scene.add(mesh);
      this._updatables.add(updatable);
    });
  }

  public remove(...updatables: Updatable[]) {
    updatables.forEach((updatable) => {
      const mesh = updatable.getMesh();

      this._scene.remove(mesh);
      this._updatables.delete(updatable);
    });
  }

  private update() {
    this._updatables.forEach(updatable => updatable.update());
  }

  public render() {
    // Update position/rotation/colour etc of THREE.js meshes
    this.update();

    this._panActualX += (this._panTargetX - this._panActualX) * config.scene.panCatchupSpeed;
    this._panActualY += (this._panTargetY - this._panActualY) * config.scene.panCatchupSpeed;
    this._camera.position.x = -this._panActualX * config.scene.panAmount;
    this._camera.position.y = this._panActualY * config.scene.panAmount;
    this._camera.lookAt(WorldPoint.getPoint(0, 0, Scene.Z_BASE_DISTANCE).toVector3());

    // this._light.position.x = -this._panActualX * 10;
    // this._light.position.y = this._panActualY * 10;

    // Re-render everything on the scene through THREE.js
    this._renderer.render(this._scene, this._camera);

    requestAnimationFrame(() => this.render());
  }

  /**
   * Animates a rotation from a percent, to a percent
   *
   * @param startRotationPercentage Where the rotation should start
   * @param endRotationPercentage Where the rotation should end
   * @param durationMs How long the rotation should take
   * @param rotationCallbackFn Signals to the CanvasService to update the
   *                           rotation, and update the position of the Needle
   */
  public animateRotation(
    startRotationPercentage: number,
    endRotationPercentage: number,
    durationMs: number,
    rotationCallbackFn: (rotationPercentage: number) => boolean,
  ) {
    // Immediately rotate to the start percentage
    rotationCallbackFn(startRotationPercentage);

    let animationEndMs: number;

    const renderFn = (nowMs: number) => {
      const remainingMs = animationEndMs - nowMs;

      // If the animation has ended
      if (remainingMs < 0) {
        rotationCallbackFn(endRotationPercentage);
        return;
      }

      // TODO: Here I can apply easing formulas for the animation
      const animationDecimal = 1 - (remainingMs / durationMs);

      // Difference of startPercent (e.g. 30) and endPercent (e.g. 80), e.g. 80% - 30% = 50%
      // Multiply by how far we are in the anim, e.g. 50% of the way through the animation gives 25%
      // Add that number to the startRotationPercentage, e.g. 30% + 25% = 55%
      const currentRotationPercentage = (endRotationPercentage - startRotationPercentage)
                                      * animationDecimal
                                      + startRotationPercentage;

      // Fire the callback, letting the CanvasService know we've rotated
      // (and need to, for example, update the playing needle)
      const shouldContinueAnimation = rotationCallbackFn(currentRotationPercentage);
      if (!shouldContinueAnimation) {
        return;
      }

      // Repeat until the animation has finished
      requestAnimationFrame(renderFn);
    };

    requestAnimationFrame((startMs) => {
      animationEndMs = startMs + durationMs;

      renderFn(startMs);
    });
  }

  /**
   * Update the rotation of points on the canvas by a percentage
   *
   * @param percentage The percent of the way through the song
   *                   (0 being the start of the song, 100 being the end)
   */
  public async setRotationPercentage(percentage: number) {
    WorldPoint.rotationOffsetPercentage = percentage;
    Rotation.rotationOffsetPercentage = percentage;
  }
}

export default Scene;
