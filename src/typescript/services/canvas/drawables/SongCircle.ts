import Track from '../../../models/audio-analysis/Track';
import WorldPoint from './points/WorldPoint';
import Scene from './Scene';
import * as conversions from './utils/conversions';
import Updatable, { NamedMesh } from './Updatable';
import Circle from './utils/Circle';

class SongCircle extends Updatable {
  private static WHITE_COLOUR: Uint8Array = new Uint8Array([255, 255, 255, 255]);
  private static BLACK_COLOUR: Uint8Array = new Uint8Array([0, 0, 0, 255]);
  private static TRANSPARENT_OVERLAY: number[] = [1, 1, 1, 1]; // Colour to overlay textures with
  private static DARKEN_OVERLAY: number[] = [0.4, 0.4, 0.4, 1];
  private static CIRCLE_RESOLUTION = 1;
  private static DEGREES_IN_CIRCLE = 360;

  protected _namedMeshes: [NamedMesh, NamedMesh, NamedMesh];

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

    const circleMesh = this.getCircle(track, this.center, radius, backgroundColour);
    const circleOutlineMesh = this.getCircleOutline(this.center, radius, _lineWidth);

    this._namedMeshes = [circleMesh, circleOutlineMesh, null];

    this.renderText(scene, track, this.center, radius, _lineWidth);

    scene.add(this);
  }

  private getCircle(
    track: Track,
    center: WorldPoint,
    radius: number,
    backgroundColour: number,
  ): NamedMesh {
    const THREE = Scene.THREE;
    const geometry = new THREE.CircleGeometry(radius, SongCircle.DEGREES_IN_CIRCLE);
    let material;

    if (backgroundColour === null) {
      const texture = new THREE.TextureLoader().load(track.bestImageURL);

      material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, map: texture });
    } else {
      material = new THREE.MeshBasicMaterial({ color: backgroundColour });
    }

    const circle =  super.createNamedMesh(geometry, material);
    circle.mesh.position.set(center.x, center.y, center.z - 0.0001);

    return circle;
  }

  private getCircleOutline(
    center: WorldPoint,
    radius: number,
    lineWidth: number,
  ): NamedMesh {
    const THREE = Scene.THREE;
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
    const circleOutline = super.createNamedMesh(geometry, material);
    circleOutline.mesh.position.set(center.x, center.y, center.z);
    circleOutline.mesh.drawMode = THREE.TriangleStripDrawMode;

    return circleOutline;
  }

  private renderText(
    scene: Scene,
    track: Track,
    center: WorldPoint,
    radius: number,
    lineWidth: number,
  ) {
    const THREE = Scene.THREE;
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
        predictedWidth = box.getSize().x;
      }

      text.position.set(center.x, center.y, center.z + 0.00002);

      this._namedMeshes[2] = super.nameMesh(text);

      scene.add(this);
    });
  }

  public get center(): WorldPoint {
    if (!this._parentSongCircle) {
      return WorldPoint.getPoint(0, 0);
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

  public updatePosition() {
    const { x, y, z } = this.center;
    const [circleMesh, circleOutlineMesh, textMesh] = this._namedMeshes;

    circleMesh.mesh.position.set(x, y, z);
    circleOutlineMesh.mesh.position.set(x, y, z);

    if (textMesh) {
      textMesh.mesh.position.set(x, y, z + 0.00002);
    }
  }
}

export default SongCircle;
