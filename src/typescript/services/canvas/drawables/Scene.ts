import CanvasService from '../CanvasService';
import * as conversions from './utils/conversions';
import WorldPoint from './points/WorldPoint';
import Updatable from './Updatable';
import SongCircle from '../../canvas/drawables/SongCircle';

export type Drawable = {
  meshes: THREE.Mesh[];
};

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

  private updatables: Set<Updatable> = new Set();
  private lastRenderSecs: number = null;

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
  }

  public static getInstance(whereToDraw: HTMLCanvasElement): Scene {
    if (this._instance) {
      return this._instance;
    }

    return this._instance = new this(whereToDraw);
  }

  public add(updatable: Updatable) {
    const namedMeshes = updatable.getNamedMeshes();

    // Add each mesh to the scene if they don't already exist
    namedMeshes.forEach(({ UUID, mesh }) => {
      const object = this.scene.getObjectByName(UUID);

      if (!object) {
        this.scene.add(mesh);
      }
    });

    this.updatables.add(updatable);
  }

  private updatePositions() {
    this.updatables.forEach((updatable) => {
      updatable.updatePosition();
    });
  }

  public deleteMeshesByUUIDs(...UUIDs: string[]) {
    UUIDs.forEach(UUID => this.scene.getObjectByName(UUID));
  }

  public render(nowSecs: number) {
    const rotationSpeed = 10;

    // Get the time passed since the last time this fn was called
    const deltaSecs = nowSecs - this.lastRenderSecs;

    // Update the last time this fn was called to now (for future calls)
    this.lastRenderSecs = nowSecs;

    // Add rotation to all points in the World, update all positions
    WorldPoint.rotationOffsetPercentage += rotationSpeed * deltaSecs;
    this.updatePositions();

    // Re-render everything on the scene through THREE.js
    this.renderer.render(this.scene, this.camera);
  }
}

export default Scene;
