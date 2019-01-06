import Track from '../../../models/audio-analysis/Track';
import WorldPoint from './utils/WorldPoint';
import Scene from './Scene';
import * as conversions from './utils/conversions';
import Updatable from './Updatable';
import Circle from './utils/Circle';
import * as THREE from 'three';

class SongCircle extends Updatable {
  private static WHITE_COLOUR: Uint8Array = new Uint8Array([255, 255, 255, 255]);
  private static BLACK_COLOUR: Uint8Array = new Uint8Array([0, 0, 0, 255]);
  private static TRANSPARENT_OVERLAY: number[] = [1, 1, 1, 1]; // Colour to overlay textures with
  private static DARKEN_OVERLAY: number[] = [0.4, 0.4, 0.4, 1];
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
    }

    super.addAll(scene);
  }

  private addCircle(
    track: Track,
    radius: number,
    backgroundColour: number,
  ) {
    const geometry = new THREE.CircleGeometry(radius, SongCircle.DEGREES_IN_CIRCLE);
    let material;

    if (backgroundColour === null) {
      const texture = new THREE.TextureLoader().load(track.bestImageURL);

      material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, map: texture });
    } else {
      material = new THREE.MeshBasicMaterial({ color: backgroundColour });
    }

    const position = WorldPoint.getPoint(0, 0, -0.0001);

    super.createAndAddMesh({
      geometry,
      material,
      position,
    });
  }

  private addCircleOutline(
    radius: number,
    lineWidth: number,
  ) {
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

    const material = new THREE.MeshBasicMaterial({ color: 0x2F3640 });

    super.createAndAddMesh({
      geometry,
      material,
      drawMode: THREE.TriangleStripDrawMode,
    });
  }

  private addText(
    track: Track,
    radius: number,
    lineWidth: number,
  ) {
    const loader = new THREE.FontLoader();

    loader.load('/dist/fonts/san-fransisco/regular.json', (font: any) => {
      let fontSize = 0.5;
      let predictedWidth: number = null;
      let text: THREE.Mesh = null;

      const generateText = (fontSize: number): THREE.Mesh => {
        const geometry = new THREE.TextGeometry(track.name, {
          font,
          size: fontSize,
          height: 0,
          curveSegments: 4,
        });
        geometry.center();

        const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const text = new THREE.Mesh(geometry, material);

        return text;
      };

      const circumference = radius * 2;
      const padding = lineWidth * 4;

      while (!predictedWidth || predictedWidth > circumference - padding) {
        fontSize -= 0.025;
        text = generateText(fontSize);

        const box = new THREE.Box3().setFromObject(text);
        const center = new THREE.Vector3();
        predictedWidth = box.getSize(center).x;
      }

      const position = WorldPoint.getPoint(0, 0, 0.00002);

      super.addMesh({
        position,
        mesh: text,
      });
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

    // Make smaller circles (songs with a smaller durations) appear in front
    // So, give smaller circles a smaller Z
    // One trillion isn't special here, it's just making Z small
    const oneTrillion = 1000000000;
    centerWorldPoint.z = Scene.Z_BASE_DISTANCE - this.track.duration.ms / oneTrillion;

    return centerWorldPoint;
  }
}

export default SongCircle;
