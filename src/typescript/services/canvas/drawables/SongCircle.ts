import Track from '../../../models/audio-analysis/Track';
import WorldPoint from './utils/WorldPoint';
import Scene from './Scene';
import * as conversions from '../../../utils/conversions';
import Updatable from './Updatable';
import Circle from './utils/Circle';
import * as THREE from 'three';

class SongCircle extends Updatable {
  private static BACKGROUND_COLOUR: number = 0xFFFFFF;
  private static TEXT_COLOUR: number = 0xFFFFFF;
  public static EDGE_COLOUR: number = 0x000000;
  private static HIGHLIGHT_COLOUR: number = 0xE74C3C;
  private static DARK_OVERLAY_OPACITY: number = 0.6;
  private static CIRCLE_RESOLUTION = 1;
  private static DEGREES_IN_CIRCLE = 360;

  constructor(
    scene: Scene,
    public track: Track,
    public radius: number,
    private _lineWidth: number,
    private _parentSongCircle: SongCircle = null,
    private _percentage: number = -1,
    backgroundColour: number = null, // If present, this overrides the album art
  ) {
    super();

    this.addCircle(track, radius, backgroundColour);
    this.addCircleOutline(radius, _lineWidth);

    if (_parentSongCircle) {
      this.addText(track, radius, _lineWidth);
    } else {
      this.addNeedle(_lineWidth);
    }

    super.addAll(scene);
  }

  private addCircle(track: Track, radius: number, backgroundColour: number) {
    const geometry = new THREE.CircleGeometry(radius, SongCircle.DEGREES_IN_CIRCLE);
    let material;

    if (backgroundColour === null) {
      const texture = new THREE.TextureLoader().load(track.bestImageURL);

      material = new THREE.MeshPhongMaterial({
        emissive: SongCircle.BACKGROUND_COLOUR,
        emissiveMap: texture,
        emissiveIntensity: 1 - SongCircle.DARK_OVERLAY_OPACITY,
      });
    } else {
      material = new THREE.MeshBasicMaterial({ color: backgroundColour });
    }

    super.createAndAddMesh({
      geometry,
      material,
      renderOrder: 0,
    });
  }

  private addCircleOutline(radius: number, lineWidth: number) {
    const geometry = new THREE.Geometry();

    for (let i = 0; i <= SongCircle.DEGREES_IN_CIRCLE; i += SongCircle.CIRCLE_RESOLUTION) {
      const NUMBER_OF_VERTICES = 4;
      const nextVertexCount = i * NUMBER_OF_VERTICES;
      const angleRadians = conversions.degreesToRadians(nextVertexCount);
      const circle = new Circle(WorldPoint.getPoint(0, 0), radius, radius + lineWidth);
      const innerPoint = circle.getPointOnCircle(angleRadians, false);
      const outerPoint = circle.getPointOnCircle(angleRadians, true);

      const innerVector = new THREE.Vector3(innerPoint.x,
                                            innerPoint.y,
                                            0);
      const outerVector = new THREE.Vector3(outerPoint.x,
                                            outerPoint.y,
                                            0);

      const previousVertex2 = geometry.vertices[geometry.vertices.length - 2] || innerVector;
      const previousVertex1 = geometry.vertices[geometry.vertices.length - 1] || outerVector;

      geometry.vertices.push(
        previousVertex2, previousVertex1, innerVector,
        previousVertex1, innerVector, outerVector);
      geometry.faces.push(
        new THREE.Face3(nextVertexCount, nextVertexCount + 1, nextVertexCount + 2),
        new THREE.Face3(nextVertexCount + 1, nextVertexCount + 2, nextVertexCount + 3),
      );
    }

    const material = new THREE.MeshBasicMaterial({ color: SongCircle.EDGE_COLOUR });

    super.createAndAddMesh({
      geometry,
      material,
      drawMode: THREE.TriangleStripDrawMode,
      renderOrder: 1,
    });
  }

  private addText(track: Track, radius: number, lineWidth: number) {
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

        const material = new THREE.MeshBasicMaterial({ color: SongCircle.TEXT_COLOUR });
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
        });

        return { predictedSize, fontSize: currentFontSize };
      };

      const circumference = radius * 2; // Circumference of the circle, excluding the lineWidth
      const textHorizontalPadding = lineWidth * 5; // Horizontal padding to add to the constraint
      const textVerticalPadding = 0.025; // Vertical padding away from the center

      const titleMaxWidth = circumference - textHorizontalPadding;
      const {
        predictedSize: titlePredictedSize,
        fontSize: titleFontSize,
      } = addTextWithSizeConstraint(0.2,
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

  private addNeedle(lineWidth: number) {
    const geometry = new THREE.PlaneGeometry(lineWidth / 2, lineWidth * 4);
    const material = new THREE.MeshBasicMaterial({ color: SongCircle.HIGHLIGHT_COLOUR });
    const position = WorldPoint.getPointOnCircleFromPercentage(this, 50);

    super.createAndAddMesh({
      geometry,
      material,
      position,
      renderOrder: 2,
    });
  }

  public get center(): WorldPoint {
    if (!this._parentSongCircle) {
      return WorldPoint.getPoint(0, 0, Scene.Z_BASE_DISTANCE);
    }

    const centerWorldPoint = WorldPoint.getCenterPointOfCircleFromPercentage(this._parentSongCircle,
                                                                             this._percentage,
                                                                             this.radius,
                                                                             this._lineWidth);

    centerWorldPoint.z = Scene.Z_BASE_DISTANCE;

    return centerWorldPoint;
  }

  protected getRenderOrder(): number {
    if (!this._parentSongCircle) {
      return -10000000;
    }

    return -this.track.duration.ms;
  }
}

export default SongCircle;
