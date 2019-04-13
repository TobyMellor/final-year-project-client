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
  public initialRadius: number;
  public initialLineWidth: number;
  private _scale: number = 1;
  private _parentSongCircle: SongCircle;
  private _percentage: number;

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
    this._parentSongCircle = parentSongCircle;
    this._percentage = percentage;

    const initialRadius = this.initialRadius = this.getRadius(type, parentSongCircle, track);
    const initialLineWidth = this.initialLineWidth = this.getInitialLineWidth(initialRadius);

    this.addCircle(track, initialRadius);
    this.addCircleOutline(type, initialRadius, initialLineWidth);
    this.addText(track, initialRadius, initialLineWidth);

    super.addAll(scene);
  }

  private addCircle(track: TrackModel, initialRadius: number) {
    const geometryArtwork = new THREE.CircleGeometry(initialRadius, config.drawables.songCircle.resolution);
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
      changeType: (options: MeshAnimationOptions) => {
        const isTransitioningToChild = this.isTransitioningToChild(options.fromType, options.toType);
        const isTransitioningtoParent = this.isTransitioningToParent(options.fromType, options.toType);

        if (isTransitioningToChild || isTransitioningtoParent) {
          animations.defaultChangeScale(options);

          if (isTransitioningtoParent) {
            animations.defaultFadeOut(options);
          } else {
            animations.defaultFadeIn(options);
          }
        }
      },
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
        const isTransitioningToChild = this.isTransitioningToChild(from, to);
        const isTransitioningtoParent = this.isTransitioningToParent(from, to);

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
          animations.defaultChangeScale(options);
        }
      },
    });
  }

  private addCircleOutline(type: SongCircleType, initialRadius: number, initialLineWidth: number) {
    const innerRadius = initialRadius;
    const outerRadius = initialRadius + initialLineWidth;
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

  private addText(track: TrackModel, initialRadius: number, initialLineWidth: number) {
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
        });

        return { predictedSize, fontSize: currentFontSize };
      };

      const circumference = initialRadius * 2; // Circumference of the circle, excluding the initialLineWidth
      const textHorizontalPadding = initialLineWidth * 5; // Horizontal padding to add to the constraint
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
      const startScale = this._scale;
      const endScale = this.getRadius(type, this._parentSongCircle, this.track) / this.initialRadius;

      super.animateWithOptions(AnimationType.CHANGE_TYPE, {
        startRGB,
        endRGB,
        startScale,
        endScale,
        fromType: this._type,
        toType: type,
      }).then(() => {
        this._scale = endScale;
      });

      this._type = type;
    }
  }

  protected get center(): WorldPoint {
    if (!this._parentSongCircle) {
      return WorldPoint.getOrigin().alignToSceneBase();
    }

    const centerWorldPoint = WorldPoint.getCenterPointOfCircleFromPercentage(this._parentSongCircle,
                                                                             this._percentage,
                                                                             this.initialRadius,
                                                                             this.initialLineWidth);

    return centerWorldPoint.alignToSceneBase();
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

  private getRadius(
    type: SongCircleType,
    parentSongCircle: SongCircle | null,
    track: TrackModel,
  ): number {
    if (type === SongCircleType.PARENT) {
      return 1;
    }

    if (!parentSongCircle) {
      return 0.25;
    }

    const relativeSize = track.duration.ms / parentSongCircle.track.duration.ms;
    return relativeSize * parentSongCircle.initialRadius;
  }

  private getInitialLineWidth(radius: number): number {
    return radius * 0.1;
  }
}

export default SongCircle;
