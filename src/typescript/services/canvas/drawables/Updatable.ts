import * as THREE from 'three';
import WorldPoint from './utils/WorldPoint';
import Scene from './Scene';
import Rotation from './utils/Rotation';
import { number } from 'prop-types';

abstract class Updatable {
  private _group: THREE.Group;
  public abstract center: WorldPoint;
  protected _rotation: Rotation = Rotation.getZero();
  protected abstract getRenderOrder(): number;

  protected constructor() {
    this._group = new THREE.Group;
  }

  protected createAndAddMesh(options: CreateMeshOptions) {
    const mesh = new THREE.Mesh(options.geometry, options.material);

    this.addMesh({ mesh, ...options });
  }

  protected addMesh({
    mesh,
    position = WorldPoint.getPoint(0, 0, 0),
    drawMode = THREE.TrianglesDrawMode,
    rotation = Rotation.getZero(),
    renderOrder,
  }: AddMeshOptions) {
    mesh.position.set(position.x, position.y, position.z);
    mesh.rotation.set(rotation.x, rotation.y, rotation.z);
    mesh.renderOrder = this.getRenderOrder() + renderOrder;

    if (mesh instanceof THREE.Mesh) {
      mesh.drawMode = drawMode;
    }

    this._group.add(mesh);
  }

  public getMesh(): THREE.Group {
    return this._group;
  }

  public update() {
    const center = this.center;
    const rotation = this.rotation;

    this._group.position.set(center.x, center.y, center.z);
    this._group.rotation.set(rotation.x, rotation.y, rotation.z);
  }

  protected addAll(scene: Scene) {
    this.update();

    // Higher numbers will appear ontop of other meshes
    this._group.renderOrder = this.getRenderOrder();

    scene.add(this);
  }

  protected get rotation() {
    return this._rotation;
  }
}

interface CreateMeshOptions extends AddMeshOptions {
  geometry: THREE.Geometry | THREE.BufferGeometry;
  material: THREE.MeshBasicMaterial;
}

interface AddMeshOptions {
  mesh?: THREE.Mesh | THREE.Line;
  position?: WorldPoint;
  drawMode?: THREE.TrianglesDrawModes;
  rotation?: Rotation;
  renderOrder: number;
}

export default Updatable;
