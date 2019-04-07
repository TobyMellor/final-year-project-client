import Updatable from './Updatable';
import * as THREE from 'three';
import WorldPoint from './utils/WorldPoint';
import Rotation from './utils/Rotation';

export type Drawable = {
  meshes: THREE.Mesh[];
};

class Scene {
  private static _instance: Scene = null;

  public static BUFFER_NUM_COMPONENTS: number = 3; // How many dimensions?
  public static Z_BASE_DISTANCE = -5;

  private static CAMERA_FOV_DEGREES: number = 45;
  private static CAMERA_ASPECT_RATIO: number = window.innerWidth / window.innerHeight;
  public static CAMERA_Z_CLIP_NEAR: number = 0.1;
  public static CAMERA_Z_CLIP_FAR: number = 3000.0;
  public static CAMERA_POSITION: number[] = [0.0, 0.0, -5.0];

  private _scene: THREE.Scene = null;
  private _camera: THREE.Camera = null;
  private _renderer: THREE.WebGLRenderer = null;

  private _updatables: Set<Updatable> = new Set();

  private constructor(whereToDraw: HTMLCanvasElement) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(Scene.CAMERA_FOV_DEGREES,
                                               Scene.CAMERA_ASPECT_RATIO,
                                               Scene.CAMERA_Z_CLIP_NEAR,
                                               Scene.CAMERA_Z_CLIP_FAR);

    const renderer = new THREE.WebGLRenderer({
      canvas: whereToDraw,
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xFFFFFF);
    renderer.setSize(window.innerWidth, window.innerHeight);

    this._scene = scene;
    this._camera = camera;
    this._renderer = renderer;

    // Starts the render loop
    requestAnimationFrame(() => this.render());
  }

  public static getInstance(whereToDraw: HTMLCanvasElement): Scene {
    if (this._instance) {
      return this._instance;
    }

    return this._instance = new this(whereToDraw);
  }

  public add(updatable: Updatable) {
    const mesh = updatable.getMesh();

    this._scene.add(mesh);
    this._updatables.add(updatable);
  }

  public remove(updatable: Updatable) {
    const mesh = updatable.getMesh();

    this._scene.remove(mesh);
    this._updatables.delete(updatable);
  }

  private update() {
    this._updatables.forEach(updatable => updatable.update());
  }

  public render() {
    // Update position/rotation/colour etc of THREE.js meshes
    this.update();

    // Re-render everything on the scene through THREE.js
    this._renderer.render(this._scene, this._camera);

    requestAnimationFrame(() => this.render());
  }

  public animateRotation(
    startRotationPercentage: number,
    endRotationPercentage: number,
    durationMs: number,
    rotationCallbackFn: (rotationPercentage: number) => void,
  ) {
    // Immediately rotate to the start percentage
    this.setRotationPercentage(startRotationPercentage);

    let animationEndMs: number;

    const renderFn = (nowMs: number) => {
      const remainingMs = animationEndMs - nowMs;

      // If the animation has ended
      if (remainingMs < 0) {
        this.setRotationPercentage(endRotationPercentage);
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

      this.setRotationPercentage(currentRotationPercentage);

      // Fire the callback, letting the CanvasService know we've rotated
      // (and need to, for example, update the playing needle)
      rotationCallbackFn(currentRotationPercentage);

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
