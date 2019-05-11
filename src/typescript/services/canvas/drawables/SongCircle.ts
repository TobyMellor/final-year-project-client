import TrackModel from '../../../models/audio-analysis/Track';
import WorldPoint from './utils/WorldPoint';
import Scene from './Scene';
import * as conversions from '../../../utils/conversions';
import Updatable, { MeshAnimationOptions } from './Updatable';
import Circle from './utils/Circle';
import * as THREE from 'three';
import config from '../../../config';
import { SongCircleType, AnimationType } from '../../../types/enums';
import * as animations from '../../../utils/animations';
import * as math from '../../../utils/math';

type Input = {
  scene: Scene,
  type: SongCircleType,
  track: TrackModel,
  parentSongCircle?: SongCircle | null, // null if it's the first parent
  percentage?: number,
};

class SongCircle extends Updatable {
  private _type: SongCircleType;
  public track: TrackModel;
  public radius: number;
  public lineWidth: number;
  public parentSongCircle: SongCircle;
  private _percentage: number;
  private _childDepth: number;

  constructor({
    scene,
    type,
    track,
    parentSongCircle = null,
    percentage = -1,
  }: Input) {
    super();

    this._type = type;
    this.track = track;
    this.parentSongCircle = parentSongCircle;
    this._percentage = percentage;

    this.radius = this.getRadius(track);
    this.lineWidth = this.getLineWidth(this.radius);
    this._childDepth = this.getChildDepth(this.parentSongCircle);

    this.addCircle(track, this.radius);
    this.addCircleOutline(type);
    this.addText(track);

    super.addAll(scene);
  }

  private addCircle(track: TrackModel, radius: number) {
    const geometryArtwork = new THREE.CircleGeometry(this.radius, config.drawables.songCircle.resolution);
    const geometryOverlay = geometryArtwork.clone();

    const texture = new THREE.TextureLoader().load(track.bestImageURL);

    const materialArtwork = new THREE.MeshLambertMaterial({
      color: config.drawables.songCircle.colour.background,
      map: texture,
    });
    const materialOverlay = new THREE.MeshLambertMaterial({
      color: config.drawables.songCircle.colour.darkOverlay,
      opacity: config.drawables.songCircle.opacity.darkOverlay,
    });

    super.createAndAddMesh({
      geometry: geometryArtwork,
      material: materialArtwork,
      renderOrder: 0,
      shouldKeepUpright: true,
      fadeIn: ({ animationDecimal, material }) => {
        if (!this.isParentSongCircle()) {
          material.opacity = animationDecimal;
        }
      },
      canChangeType: true,
      changeType: (options: MeshAnimationOptions) => this.fadeChildParentMeshes(options),
    });

    super.createAndAddMesh({
      geometry: geometryOverlay,
      material: materialOverlay,
      renderOrder: 1,
      fadeIn: ({ animationDecimal, material, geometry, isFirstLoop }) => {
        material.opacity = animationDecimal * config.drawables.songCircle.opacity.darkOverlay;

        if (isFirstLoop && this.isParentSongCircle()) {
          material.color.setHex(config.drawables.songCircle.colour.background);
          geometry.colorsNeedUpdate = true;
        }
      },
      canChangeType: true,
      changeType: (options: MeshAnimationOptions) => {
        const { fromType: from, toType: to, animationDecimal, material } = options;
        const isTransitioningToChild = this.isTransitioningToChild(from as SongCircleType, to as SongCircleType);
        const isTransitioningtoParent = this.isTransitioningToParent(from as SongCircleType, to as SongCircleType);

        if (isTransitioningToChild || isTransitioningtoParent) {
          const colours = config.drawables.songCircle.colour;
          const darkOverlayOpacity = config.drawables.songCircle.opacity.darkOverlay;
          const [
            startColour,
            endColour,
            startOpacity,
            endOpacity,
          ] = isTransitioningtoParent
            ? [colours.darkOverlay, colours.background, darkOverlayOpacity, 1]
            : [colours.background, colours.darkOverlay, 1, darkOverlayOpacity];

          // Fade to white if parent, or fade to transparent dark overlay
          animations.defaultChangeColour({
            ...options,
            startRGB: conversions.decimalToRgb(startColour),
            endRGB: conversions.decimalToRgb(endColour),
          });

          material.opacity = animations.getProgressFromTo(startOpacity, endOpacity, animationDecimal);
        }
      },
    });
  }

  private addCircleOutline(type: SongCircleType) {
    const innerRadius = this.radius;
    const outerRadius = this.radius + this.lineWidth;
    const geometry = new THREE.RingGeometry(innerRadius, outerRadius, config.drawables.songCircle.resolution);
    const material = new THREE.MeshLambertMaterial({
      color: config.drawables.songCircle.colour.edge[type],
    });

    super.createAndAddMesh({
      geometry,
      material,
      drawMode: THREE.TriangleStripDrawMode,
      renderOrder: 2,
      canChangeType: true,
    });
  }

  private addText(track: TrackModel) {
    const loader = new THREE.FontLoader();

    loader.load('/dist/fonts/san-fransisco/regular.json', (font: any) => {

      /**
       * Generate a text mesh with a font size.
       *
       * The text will aligned to the center of the circle horizontally.
       *
       * @param fontSize Size of the font
       * @param text The text to be displayed
       */
      const generateText = (fontSize: number, text: string): THREE.Mesh => {
        const geometry = new THREE.TextGeometry(text, {
          font,
          size: fontSize,
          height: 0,
          curveSegments: 4,
        });

        // Align the text to the center of the circle horizontally
        function centerX(geometry: THREE.TextGeometry) {
          const offset = new THREE.Vector3();

          geometry.computeBoundingBox();
          geometry.boundingBox.getCenter(offset).negate();

          geometry.translate(offset.x, 0, 0);
        }

        // Ensure the MIDDLE of the text is aligned to the middle of the circle
        // (instead of the LEFT of the text)
        centerX(geometry);

        const material = new THREE.MeshBasicMaterial({
          color: config.drawables.songCircle.colour.text,
          transparent: true,
          opacity: 0,
        });
        const textMesh = new THREE.Mesh(geometry, material);

        return textMesh;
      };

      /**
       * Creates and adds a text mesh to the scene that fits within the circle
       *
       * Since letters in text are varying, (e.g. m is wider than i), we need to
       * try a large font size. If that doesn't fit within our size constraint,
       * it will try again with a smaller font size until it fits.
       *
       * @param startFontSize The font size to start with
       * @param maxWidth The width by which the text must not overflow
       * @param text The text to be displayed
       * @param isBelowCenter Whether the text will appear above or below the center
       * @param centerPadding How much vertical padding should be applied
       */
      const addTextWithSizeConstraint = (
        startFontSize: number,
        maxWidth: number,
        text: string,
        isBelowCenter: boolean,
        centerPadding: number,
      ): { predictedSize: THREE.Vector3, fontSize: number } => {
        let currentFontSize = startFontSize;
        let predictedSize: THREE.Vector3 = null;
        let textMesh: THREE.Mesh = null;

        // Generate text with a font size. If it doesn't fit in the constraint, reduce and repeat.
        while (!predictedSize || predictedSize.x > maxWidth) {
          currentFontSize -= 0.025;
          textMesh = generateText(currentFontSize, text);

          const box = new THREE.Box3().setFromObject(textMesh);
          const center = new THREE.Vector3();
          predictedSize = box.getSize(center);
        }

        const yPos = isBelowCenter ? -centerPadding - predictedSize.y : centerPadding;
        const position = WorldPoint.getPoint(0, yPos, 0);

        // Render this text
        super.addMesh({
          position,
          mesh: textMesh,
          renderOrder: 2,
          shouldKeepUpright: true,
          fadeIn: ({ animationDecimal, mesh }) => {
            if (!this.isParentSongCircle()) {
              (<THREE.Material>mesh.material).opacity = animationDecimal;
            }
          },
          canChangeType: true,
          changeType: (options: MeshAnimationOptions) => this.fadeChildParentMeshes(options),
        });

        return { predictedSize, fontSize: currentFontSize };
      };

      const circumference = this.radius * 2; // Circumference of the circle, excluding the this.lineWidth
      const textHorizontalPadding = this.lineWidth * 5; // Horizontal padding to add to the constraint
      const textVerticalPadding = 0.025; // Vertical padding away from the center

      const titleMaxWidth = circumference - textHorizontalPadding;
      const {
        predictedSize: titlePredictedSize,
        fontSize: titleFontSize,
      } = addTextWithSizeConstraint(0.3,
                                    titleMaxWidth,
                                    track.name,
                                    false,
                                    textVerticalPadding);

      const subtitleMaxWidth = titlePredictedSize.x;
      addTextWithSizeConstraint(titleFontSize,
                                subtitleMaxWidth,
                                track.album.name,
                                true,
                                textVerticalPadding);

    });
  }

  public set type(type: SongCircleType) {
    if (this._type !== type) {
      const startRGB = conversions.decimalToRgb(config.drawables.songCircle.colour.edge[this._type]);
      const endRGB = conversions.decimalToRgb(config.drawables.songCircle.colour.edge[type]);

      super.animateWithOptions(AnimationType.CHANGE_TYPE, {
        startRGB,
        endRGB,
        fromType: this._type,
        toType: type,
      });

      this._type = type;
    }
  }

  protected get center(): WorldPoint {
    if (!this.parentSongCircle) {
      return WorldPoint.getOrigin().alignToSceneBase();
    }

    return WorldPoint.getCenterPointOfCircleFromPercentage(this.parentSongCircle,
                                                           this._percentage,
                                                           this.radius,
                                                           this.lineWidth).alignToSceneBase();
  }

  protected getRenderOrder(): number {
    if (this.isParentSongCircle()) {
      return -10000000;
    }

    return -this.track.duration.ms;
  }

  private isParentSongCircle() {
    return this._type === SongCircleType.PARENT;
  }

  private isTransitioningToParent(fromType: SongCircleType, toType: SongCircleType) {
    return fromType === SongCircleType.NEXT_PARENT_READY && toType === SongCircleType.PARENT;
  }

  private isTransitioningToChild(fromType: SongCircleType, toType: SongCircleType) {
    return fromType === SongCircleType.PARENT && toType === SongCircleType.CHILD;
  }

  private getRadius(track: TrackModel): number {
    return math.normalizeNumber(track.duration.secs,
                                config.drawables.songCircle.minSongCircleDurationSecs,
                                config.drawables.songCircle.maxSongCircleDurationSecs,
                                config.drawables.songCircle.minSongCircleSize,
                                config.drawables.songCircle.maxSongCircleSize);
  }

  private getLineWidth(radius: number): number {
    return radius * 0.1;
  }

  private fadeChildParentMeshes(options: MeshAnimationOptions) {
    const to = options.toType as SongCircleType;
    const from = options.fromType as SongCircleType;
    const isTransitioningToChild = this.isTransitioningToChild(from, to);
    const isTransitioningtoParent = this.isTransitioningToParent(from, to);

    if (isTransitioningtoParent) {
      animations.defaultFadeOut(options);
    } else if (isTransitioningToChild) {
      animations.defaultFadeIn(options);
    }
  }

  private getChildDepth(parentSongCircle: SongCircle | null, depth: number = 0): number {
    if (!parentSongCircle) {
      return depth;
    }

    return this.getChildDepth(parentSongCircle.parentSongCircle, depth + 1);
  }
}

export default SongCircle;
