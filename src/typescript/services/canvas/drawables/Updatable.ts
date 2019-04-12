import * as THREE from 'three';
import WorldPoint from './utils/WorldPoint';
import Scene from './Scene';
import Rotation from './utils/Rotation';
import config from '../../../config';
import * as bezierEasing from 'bezier-easing';

abstract class Updatable {
  private _group: AnimatableGroup;
  public abstract center: WorldPoint;
  protected _rotation: Rotation = Rotation.getZero();
  protected abstract getRenderOrder(): number;
  private static OFFSET_AMOUNT_DEGREES: number = 90;

  protected constructor() {
    this._group = new AnimatableGroup();
  }

  protected createAndAddMesh(options: CreateMeshOptions) {
    if (!options.shouldKeepVisible) {
      options.material.transparent = true;
      options.material.opacity = 0;
    }

    const mesh = new THREE.Mesh(options.geometry, options.material);

    this.addMesh({ mesh, ...options });
  }

  protected addMesh({
    mesh,
    position = WorldPoint.getOrigin(),
    drawMode = THREE.TrianglesDrawMode,
    rotation = Rotation.getZero(),
    renderOrder,
    fadeIn = (animationDecimal: number, mesh: AnimatableMesh) => {
      (<THREE.Material>mesh.material).opacity = animationDecimal;
    },
    fadeOut = (animationDecimal: number, mesh: AnimatableMesh) => fadeIn(1 - animationDecimal, mesh),
    shouldKeepUpright = false,
    shouldInversePercentage = false,
  }: AddMeshOptions) {
    mesh.renderOrder = this.getRenderOrder() + renderOrder;
    mesh.fadeIn = fadeIn;
    mesh.fadeOut = fadeOut;

    let newPosition = position;
    let newRotation = rotation;

    // Needle should appear at the bottom
    if (shouldInversePercentage) {
      newPosition = newPosition.flip();
      newRotation = newRotation.flip();
    }

    // Text and images should be rotated so that they're pointing upright
    if (shouldKeepUpright) {
      newPosition = newPosition.rotateAndFlip(Updatable.OFFSET_AMOUNT_DEGREES);
      newRotation = newRotation.rotateAndFlip(Updatable.OFFSET_AMOUNT_DEGREES);
    }

    if (name) {
      mesh.name = name;
    }

    this.setMeshAttributes(
      mesh,
      newPosition,
      newRotation,
    );

    if (mesh instanceof THREE.Mesh) {
      mesh.drawMode = drawMode;
    }

    this._group.add(mesh);
  }

  public getMesh(): AnimatableGroup {
    return this._group;
  }

  /**
   * Updates the position and rotation of the group of meshes.
   *
   * OFFSET_AMOUNT_DEGREES is the amount needed to ensure that "0%" appears
   * upright at the bottom of the user's screen (instead of to the right)
   */
  public update() {
    const worldPoint = this.center.rotate(-Updatable.OFFSET_AMOUNT_DEGREES);
    const rotation = this.rotation.rotate(-Updatable.OFFSET_AMOUNT_DEGREES);
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
    mesh: THREE.Mesh | AnimatableGroup | THREE.Line,
    worldPoint: WorldPoint,
    rotation: Rotation,
  ) {
    mesh.position.set(worldPoint.x, worldPoint.y, worldPoint.z);
    mesh.rotation.set(rotation.x, rotation.y, rotation.z);
  }

  public animate(
    durationMs: number,
    animationFn: (animationDecimal: number, meshes: AnimatableMesh[], isFirstLoop?: boolean) => void,
  ) {
    const meshes = this._group.children as THREE.Mesh[];
    let animationEndMs: number;
    animationFn(0, meshes, true);

    const renderFn = (nowMs: number) => {
      const remainingMs = animationEndMs - nowMs;

      // If the animation has ended
      if (remainingMs < 0) {
        animationFn(1, meshes);
        return;
      }

      // TODO: Here I can apply easing formulas for the animation
      const easing = bezierEasing(0.42, 0, 1, 1);
      const animationDecimal = easing(1 - (remainingMs / durationMs));
      animationFn(animationDecimal, meshes, false);

      // Repeat until the animation has finished
      requestAnimationFrame(renderFn);
    };

    requestAnimationFrame((startMs) => {
      animationEndMs = startMs + durationMs;

      renderFn(startMs);
    });
  }

  public static animateIn(...updatables: Updatable[]) {
    // The setTimeout really helps here with initial lag during the loading of the page, potentially because
    // this task is scheduled after intensive work analysing branches (See: https://www.youtube.com/watch?v=cCOL7MC4Pl0)
    setTimeout(() => {
      updatables.forEach(updatable => updatable.animate(config.drawables.fadeInDurationMs, updatable.fadeIn));
    }, 0);
  }

  public static animateOut(...updatables: Updatable[]) {
    setTimeout(() => {
      updatables.forEach(updatable => updatable.animate(config.drawables.fadeOutDurationMs, updatable.fadeOut));
    }, 0);
  }

  private fadeIn(animationDecimal: number, meshes: AnimatableMesh[], isFirstLoop: boolean) {
    meshes.forEach(mesh => mesh.fadeIn(animationDecimal, mesh, isFirstLoop));
  }

  private fadeOut(animationDecimal: number, meshes: AnimatableMesh[]) {
    meshes.forEach(mesh => mesh.fadeOut(animationDecimal, mesh));
  }
}

class AnimatableGroup extends THREE.Group {
  public children: AnimatableMesh[];

  constructor() {
    super();
  }
}

export interface AnimatableMesh extends THREE.Mesh {
  fadeIn?: (animationDecimal: number, mesh: AnimatableMesh, isFirstLoop?: boolean) => void;
  fadeOut?: (animationDecimal: number, mesh: AnimatableMesh, isFirstLoop?: boolean) => void;
}

interface CreateMeshOptions extends AddMeshOptions {
  geometry: THREE.Geometry | THREE.BufferGeometry;
  material: THREE.MeshLambertMaterial | THREE.MeshBasicMaterial;
}

interface AddMeshOptions {
  mesh?: AnimatableMesh;
  position?: WorldPoint;
  drawMode?: THREE.TrianglesDrawModes;
  rotation?: Rotation;
  renderOrder: number;

  // The identifier given to the mesh
  name?: string;

  // Text and Images should be kept upright. Everything else should be offset so that
  // 0% appears at the bottom of the user's screen.
  shouldKeepUpright?: boolean;

  // Used for the needles. When we want to indicate the needle is at a point in the song,
  // it offset the rotation so it appears at the bottom of the circle
  shouldInversePercentage?: boolean;

  shouldKeepVisible?: boolean;
  fadeIn?: (animationDecimal: number, mesh: AnimatableMesh, isFirstLoop?: boolean) => void;
  fadeOut?: (animationDecimal: number, mesh: AnimatableMesh, isFirstLoop?: boolean) => void;
}

export default Updatable;
