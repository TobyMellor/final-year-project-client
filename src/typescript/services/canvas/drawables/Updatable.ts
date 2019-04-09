import * as THREE from 'three';
import WorldPoint from './utils/WorldPoint';
import Scene from './Scene';
import Rotation from './utils/Rotation';

abstract class Updatable {
  private _group: THREE.Group;
  public abstract center: WorldPoint;
  protected _rotation: Rotation = Rotation.getZero();
  protected abstract getRenderOrder(): number;
  private static OFFSET_AMOUNT_DEGREES: number = 90;

  protected constructor() {
    this._group = new THREE.Group;
  }

  protected createAndAddMesh(options: CreateMeshOptions) {
    const mesh = new THREE.Mesh(options.geometry, options.material);

    this.addMesh({ mesh, ...options });
  }

  protected addMesh({
    mesh,
    position = WorldPoint.getOrigin(),
    drawMode = THREE.TrianglesDrawMode,
    rotation = Rotation.getZero(),
    renderOrder,
    shouldKeepUpright = false,
  }: AddMeshOptions) {
    mesh.renderOrder = this.getRenderOrder() + renderOrder;

    // Text and images should be rotated so that they're pointing upright
    this.setMeshAttributes(
      mesh,
      shouldKeepUpright ? position.rotateAndFlip(Updatable.OFFSET_AMOUNT_DEGREES) : position,
      shouldKeepUpright ? rotation.rotateAndFlip(Updatable.OFFSET_AMOUNT_DEGREES) : rotation,
    );

    if (mesh instanceof THREE.Mesh) {
      mesh.drawMode = drawMode;
    }

    this._group.add(mesh);
  }

  public getMesh(): THREE.Group {
    return this._group;
  }

  /**
   * Updates the position and rotation of the group of meshes.
   *
   * OFFSET_AMOUNT_DEGREES is the amount needed to ensure that "0%" appears
   * upright at the bottom of the user's screen (instead of to the right)
   */
  public update() {
    const worldPoint = this.center.rotateAndFlip(Updatable.OFFSET_AMOUNT_DEGREES);
    const rotation = this.rotation.rotateAndFlip(-Updatable.OFFSET_AMOUNT_DEGREES);
    this.setMeshAttributes(this._group, worldPoint, rotation);
  }

  /**
   * Re-renders all of a group's children. This is useful, since some properties
   * of a mesh cannot be updated on the fly and require a re-render.
   */
  public refreshChildren() {
    const group = this._group;

    group.children.forEach((childMesh) => {
      const clone = childMesh.clone();

      // Place all updates here that require a re-render
      clone.renderOrder = this.getRenderOrder();

      group.remove(childMesh);
      group.add(clone);
    });
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

  protected setMeshAttributes(
    mesh: THREE.Mesh | THREE.Group | THREE.Line,
    worldPoint: WorldPoint,
    rotation: Rotation,
  ) {
    mesh.position.set(worldPoint.x, worldPoint.y, worldPoint.z);
    mesh.rotation.set(rotation.x, rotation.y, rotation.z);
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

  // Text and Images should be kept upright. Everything else should be offset so that
  // 0% appears at the bottom of the user's screen.
  shouldKeepUpright?: boolean;
}

export default Updatable;
