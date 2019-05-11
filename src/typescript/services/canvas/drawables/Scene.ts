import Updatable from './Updatable';
import * as THREE from 'three';
import WorldPoint from './utils/WorldPoint';
import Rotation from './utils/Rotation';
import * as conversions from '../../../utils/conversions';
import config from '../../../config';
import { AnimationCurve } from '../../../types/enums';
import * as animations from '../../../utils/animations';

export type Drawable = {
  meshes: THREE.Mesh[];
};

class Scene {
  private static _instance: Scene = null;

  private _scene: THREE.Scene = null;
  private _camera: THREE.Camera = null;
  private _renderer: THREE.WebGLRenderer = null;

  private _updatables: Set<Updatable> = new Set();

  // The last known NDC coordinates of the mouse
  private _panTargetX: number = 0;
  private _panTargetY: number = 0;

  // The current NDC coordinates of the pan, eventually will match _panTarget
  private _panActualX: number = 0;
  private _panActualY: number = 0;

  private _mousePoint: WorldPoint = null;
  private _currentRotationPercentage: number = 0;

  private getCameraLocationPointFn = () => WorldPoint.getOrigin();

  private constructor(
    whereToDraw: HTMLCanvasElement,
    private _onMouseMove: (p: WorldPoint) => void,
    private _onMouseDown: (p: WorldPoint) => void,
  ) {
    const scene = new THREE.Scene();
    const aspectRatio = this.getAspectRatio();
    const camera = new THREE.PerspectiveCamera(config.scene.cameraFOV,
                                               aspectRatio,
                                               config.scene.cameraClipNearDistance,
                                               config.scene.cameraClipFarDistance);

    const renderer = new THREE.WebGLRenderer({
      canvas: whereToDraw,
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(config.drawables.background.colour.background);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1);
    scene.add(ambientLight);

    this._scene = scene;
    this._camera = camera;
    this._renderer = renderer;

    document.addEventListener('mousemove', (e: MouseEvent) => this.onMouseMove(e), false);
    document.addEventListener('mousedown', (e: MouseEvent) => this.onMouseDown(e), false);

    // Starts the render loop
    requestAnimationFrame(() => this.render());
  }

  private onMouseMove({ clientX, clientY }: MouseEvent) {
    const [x, y] = conversions.canvasPointToNDC(clientX, clientY);

    this._panTargetX = x;
    this._panTargetY = y;

    const vec = new THREE.Vector3(); // create once and reuse

    vec.set(
      (clientX / window.innerWidth) * 2 - 1,
      -(clientY / window.innerHeight) * 2 + 1,
      0.5,
    );

    vec.unproject(this._camera);

    vec.sub(this._camera.position).normalize();

    const { x: camX, y: camY, z: camZ } = this._camera.position;
    const distance = (config.scene.sceneBaseDistance - camZ) / vec.z;

    const { x: vecX, y: vecY, z: vecZ } = vec.multiplyScalar(distance);
    const mousePoint = this._mousePoint = WorldPoint.getPoint(camX, camY, camZ).translate(vecX, vecY, vecZ);

    this._onMouseMove(mousePoint);
  }

  private onMouseDown(e: MouseEvent) {
    this.onMouseMove(e);

    this._onMouseDown(this._mousePoint);
  }

  private getAspectRatio() {
    return window.innerWidth / window.innerHeight;
  }

  public static getInstance(
    whereToDraw: HTMLCanvasElement,
    onMouseMove: (p: WorldPoint) => void,
    onMouseDown: (p: WorldPoint) => void,
  ): Scene {
    if (this._instance) {
      return this._instance;
    }

    return this._instance = new this(whereToDraw, onMouseMove, onMouseDown);
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

    const defaultCameraLocationPoint = this.getCameraLocationPointFn();
    const cameraLocationPoint = WorldPoint.getPoint(
      defaultCameraLocationPoint.x + -this._panActualX * config.scene.panAmount,
      defaultCameraLocationPoint.y + this._panActualY * config.scene.panAmount,
      defaultCameraLocationPoint.z,
    );

    this.moveCamera(cameraLocationPoint);

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
  public async animateRotation(
    startRotationPercentage: number,
    endRotationPercentage: number,
    durationMs: number,
    rotationCallbackFn: (rotationPercentage: number) => boolean,
    animationCurve = config.scene.animationCurves[AnimationCurve.LINEAR],
  ): Promise<void> {
    if (this._currentRotationPercentage !== startRotationPercentage) {
      await this.animateRotation(this._currentRotationPercentage,
                           startRotationPercentage,
                           Math.min(durationMs / 4, config.scene.maxRotationAnimationDurationMs),
                           rotationCallbackFn,
                           config.scene.animationCurves[AnimationCurve.EASE]);
    }

    return new Promise((resolve) => {
      // Immediately rotate to the start percentage
      rotationCallbackFn(startRotationPercentage);

      let animationEndMs: number;

      const renderFn = (nowMs: number) => {
        const remainingMs = animationEndMs - nowMs;

        // If the animation has ended
        if (remainingMs < 0) {
          rotationCallbackFn(endRotationPercentage);
          return resolve();
        }

        const animationDecimal = animationCurve(1 - (remainingMs / durationMs));

        // Difference of startPercent (e.g. 30) and endPercent (e.g. 80), e.g. 80% - 30% = 50%
        // Multiply by how far we are in the anim, e.g. 50% of the way through the animation gives 25%
        // Add that number to the startRotationPercentage, e.g. 30% + 25% = 55%
        const currentRotationPercentage = this._currentRotationPercentage
                                        = (endRotationPercentage - startRotationPercentage)
                                        * animationDecimal
                                        + startRotationPercentage;

        // Fire the callback, letting the CanvasService know we've rotated
        // (and need to, for example, update the playing needle)
        const shouldContinueAnimation = rotationCallbackFn(currentRotationPercentage);
        if (!shouldContinueAnimation) {
          return resolve();
        }

        // Repeat until the animation has finished
        requestAnimationFrame(renderFn);
      };

      requestAnimationFrame((startMs) => {
        animationEndMs = startMs + durationMs;

        renderFn(startMs);
      });
    });
  }

  public async animateCamera(
    getStartCameraLocationPointFn: () => WorldPoint,
    getEndCameraLocationPointFn: () => WorldPoint,
    durationMs: number,
    animationCurve = config.scene.animationCurves[AnimationCurve.EASE],
  ): Promise<void> {
    return new Promise((resolve) => {
      let animationEndMs: number;

      function getProgressToEndPoint(
        { x: startX, y: startY, z: startZ }: WorldPoint,
        { x: endX, y: endY, z: endZ }: WorldPoint,
        animationDecimal: number,
      ): WorldPoint {
        return WorldPoint.getPoint(
          animations.getProgressFromTo(startX, endX, animationDecimal),
          animations.getProgressFromTo(startY, endY, animationDecimal),
          animations.getProgressFromTo(startZ, endZ, animationDecimal),
        );
      }

      const renderFn = (nowMs: number) => {
        const remainingMs = animationEndMs - nowMs;

        // If the animation has ended
        if (remainingMs < 0) {
          this.getCameraLocationPointFn = getEndCameraLocationPointFn;
          resolve();
          return;
        }

        const animationDecimal = animationCurve(1 - (remainingMs / durationMs));

        // We're using functions here as the start and end points can change
        // as the song rotates or circle sizes increase
        const startCameraLocationPoint = getStartCameraLocationPointFn();
        const endCameraLocationPoint = getEndCameraLocationPointFn();

        const currentCameraLocationPoint = getProgressToEndPoint(startCameraLocationPoint,
                                                                endCameraLocationPoint,
                                                                animationDecimal);

        this.getCameraLocationPointFn = () => currentCameraLocationPoint;

        // Repeat until the animation has finished
        requestAnimationFrame(renderFn);
      };

      requestAnimationFrame((startMs) => {
        animationEndMs = startMs + durationMs;

        renderFn(startMs);
      });
    });
  }

  /**
   * Update the rotation of points on the canvas by a percentage
   *
   * @param percentage The percent of the way through the song
   *                   (0 being the start of the song, 100 being the end)
   */
  public setRotationPercentage(percentage: number) {
    WorldPoint.rotationOffsetPercentage = percentage;
    Rotation.rotationOffsetPercentage = percentage;
  }

  private moveCamera(cameraLocationPoint: WorldPoint) {
    this._camera.position.x = cameraLocationPoint.x;
    this._camera.position.y = cameraLocationPoint.y;
    this._camera.position.z = cameraLocationPoint.z;
  }
}

export default Scene;
