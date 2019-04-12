import * as THREE from 'three';
import WorldPoint from './utils/WorldPoint';
import Scene from './Scene';
import Rotation from './utils/Rotation';
import config from '../../../config';
import * as bezierEasing from 'bezier-easing';
import { AnimationType } from '../../../types/enums';
import * as conversions from '../../../utils/conversions';

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
    fadeIn = ({ animationDecimal, mesh }: MeshAnimationOptions) => {
      (<THREE.Material>mesh.material).opacity = animationDecimal;
    },
    fadeOut = (options: MeshAnimationOptions) => fadeIn({
      ...options,
      animationDecimal: 1 - options.animationDecimal,
    }),
    canChangeColour = false,
    shouldKeepUpright = false,
    shouldInversePercentage = false,
  }: AddMeshOptions) {
    mesh.renderOrder = this.getRenderOrder() + renderOrder;
    mesh.fadeIn = fadeIn;
    mesh.fadeOut = fadeOut;

    if (canChangeColour) {
      mesh.changeColour = (
        { startRGB: [startR, startG, startB], endRGB: [endR, endG, endB], animationDecimal }: MeshAnimationOptions,
      ) => {
        const material = mesh.material as THREE.MeshLambertMaterial;
        const geometry = mesh.geometry as THREE.Geometry;

        const currentR = startR + (endR - startR) * animationDecimal;
        const currentG = startG + (endG - startG) * animationDecimal;
        const currentB = startB + (endB - startB) * animationDecimal;

        const currentHEX = conversions.rgbToDecimal(currentR, currentG, currentB);

        material.color.setHex(currentHEX);
        geometry.colorsNeedUpdate = true;
      };
    }

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

      // Animations don't copy over in THREE.js's .clone method since we defined them
      clone.changeColour = childMesh.changeColour;
      clone.fadeIn = childMesh.fadeIn;
      clone.fadeOut = childMesh.fadeOut;

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

  private animate(
    durationMs: number,
    animationType: AnimationType,
    additionalOptions: BaseAnimationOptions = {},
  ) {
    const meshes = this._group.children as THREE.Mesh[];
    const animateMeshes = (options: { animationDecimal: number, isFirstLoop?: boolean, isLastLoop?: boolean }) => {
      const meshAnimationFn = this.getAnimationFn(animationType);

      meshes.forEach(mesh => meshAnimationFn({
        mesh,
        ...options, // animationDecimal, isFirstLoop, isLastLoop
        ...additionalOptions, // Anything required in the animation loop in the Updatable
      }));
    };

    animateMeshes({
      animationDecimal: 0,
      isFirstLoop: true,
    });

    let animationEndMs: number;
    const renderFn = (nowMs: number) => {
      const remainingMs = animationEndMs - nowMs;

      // If the animation has ended
      if (remainingMs < 0) {
        animateMeshes({
          animationDecimal: 1,
          isLastLoop: true,
        });
        return;
      }

      const easing = bezierEasing(0.42, 0, 1, 1);
      const animationDecimal = easing(1 - (remainingMs / durationMs));
      animateMeshes({ animationDecimal });

      // Repeat until the animation has finished
      requestAnimationFrame(renderFn);
    };

    requestAnimationFrame((startMs) => {
      animationEndMs = startMs + durationMs;

      renderFn(startMs);
    });
  }

  public static animate(type: AnimationType, ...updatables: Updatable[]) {
    // The setTimeout really helps here with initial lag during the loading of the page, potentially because
    // this task is scheduled after intensive work analysing branches (See: https://www.youtube.com/watch?v=cCOL7MC4Pl0)
    setTimeout(() => {
      updatables.forEach(updatable => updatable.animate(config.drawables.animations[type].durationMs, type));
    }, 0);
  }

  protected animateWithOptions(type: AnimationType, options: BaseAnimationOptions) {
    setTimeout(() => {
      this.animate(config.drawables.animations[type].durationMs, type, options);
    }, 0);
  }

  getAnimationFn(type: AnimationType) {
    switch (type) {
      case AnimationType.FADE_IN:
        return (options: MeshAnimationOptions) => options.mesh.fadeIn(options);
      case AnimationType.FADE_OUT:
        return (options: MeshAnimationOptions) => options.mesh.fadeOut(options);
      case AnimationType.CHANGE_TYPE:
        return (options: MeshAnimationOptions) => options.mesh.changeColour && options.mesh.changeColour(options);
      default:
        throw new Error('AnimationType not found!');
    }
  }
}

class AnimatableGroup extends THREE.Group {
  public children: AnimatableMesh[];

  constructor() {
    super();
  }
}

export interface AnimatableMesh extends THREE.Mesh {
  changeColour?: MeshAnimationFn;
  fadeIn?: MeshAnimationFn;
  fadeOut?: MeshAnimationFn;
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
  canChangeColour?: boolean;
  changeColour?: MeshAnimationFn;
  fadeIn?: MeshAnimationFn;
  fadeOut?: MeshAnimationFn;
}

type MeshAnimationFn = (options: MeshAnimationOptions) => void;

type BaseAnimationOptions = {
  animationDecimal?: number,
  isFirstLoop?: boolean,
  isLastLoop?: boolean,
  startRGB?: [number, number, number],
  endRGB?: [number, number, number],
};

type MeshAnimationOptions = BaseAnimationOptions & {
  mesh: AnimatableMesh,
};

export default Updatable;
