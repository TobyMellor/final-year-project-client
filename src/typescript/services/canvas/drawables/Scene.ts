import CanvasService from '../CanvasService';
import { Drawable } from './SongCircle';

class Scene {
  private static _instance: Scene = null;
  public static THREE = require('three');

  public static BUFFER_NUM_COMPONENTS: number = 3; // How many dimensions?
  public static Z_BASE_DISTANCE = -5;

  private static CAMERA_FOV_DEGREES: number = 45;
  private static CAMERA_ASPECT_RATIO: number = window.innerWidth / window.innerHeight;
  private static CAMERA_Z_CLIP_NEAR: number = 0.1;
  private static CAMERA_Z_CLIP_FAR: number = 3000.0;
  public static CAMERA_POSITION: number[] = [0.0, 0.0, -5.0];

  private scene: THREE.Scene = null;
  private camera: THREE.Camera = null;
  private renderer: THREE.WebGLRenderer = null;

  private constructor(
    whereToDraw: HTMLCanvasElement,
  ) {
    const scene = new Scene.THREE.Scene();
    const camera = new Scene.THREE.PerspectiveCamera(Scene.CAMERA_FOV_DEGREES,
                                                     Scene.CAMERA_ASPECT_RATIO,
                                                     Scene.CAMERA_Z_CLIP_NEAR,
                                                     Scene.CAMERA_Z_CLIP_FAR);

    const renderer = new Scene.THREE.WebGLRenderer({
      canvas: whereToDraw,
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xFFFFFF);
    renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    requestAnimationFrame(() => this.render());
  }

  public static getInstance(whereToDraw: HTMLCanvasElement): Scene {
    if (this._instance) {
      return this._instance;
    }

    return this._instance = new this(whereToDraw);
  }

  public add(...drawables: Drawable[]): this {
    if (drawables.length === 0) {
      return this;
    }

    const meshes = this.getMeshesFromDrawables(drawables);
    this.scene.add(...meshes);

    return this;
  }

  public delete(...drawables: Drawable[]): this {
    if (drawables.length === 0) {
      return this;
    }

    const meshes = this.getMeshesFromDrawables(drawables);
    this.scene.remove(...meshes);

    return this;
  }

  public render() {
    // console.log("RENDER NUM OF MESHES:", this.scene.)
    this.renderer.render(this.scene, this.camera);
  }

  private getMeshesFromDrawables(drawables: Drawable[]) {
    return drawables.map(drawable => drawable.meshes)
                    .reduce((a, b) => a.concat(b));
  }
}

export default Scene;
