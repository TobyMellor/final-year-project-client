import Track from '../../../models/Track';
import WorldPoint from './points/WorldPoint';
import Scene from './Scene';
import * as conversions from './utils/conversions';

class SongCircle {
  private static WHITE_COLOUR: Uint8Array = new Uint8Array([255, 255, 255, 255]);
  private static BLACK_COLOUR: Uint8Array = new Uint8Array([0, 0, 0, 255]);
  private static TRANSPARENT_OVERLAY: number[] = [1, 1, 1, 1]; // Colour to overlay textures with
  private static DARKEN_OVERLAY: number[] = [0.4, 0.4, 0.4, 1];
  private static CIRCLE_RESOLUTION = 1;
  private static DEGREES_IN_CIRCLE = 360;

  private track: Track;

  private radius: number;
  private lineWidth: number;
  private center: WorldPoint;

  constructor(
    scene: Scene,
    track: Track,
    center: WorldPoint,
    radius: number,
    lineWidth: number,
    backgroundColour: number = null, // If present, this overrides the album art
  ) {
    this.track = track;
    this.center = center;
    this.radius = radius;
    this.lineWidth = lineWidth;

    // Make smaller circles (songs with a smaller durations) appear in front
    // So, give smaller circles a smaller Z
    // One trillion isn't special here, it's just making Z small
    const oneTrillion = 1000000000;
    this.center.z = Scene.Z_BASE_DISTANCE - track.getDurationMs() / oneTrillion;

    this.renderCircle(scene, track, center, radius, backgroundColour);
    this.renderCircleOutline(scene, center, radius, lineWidth);
    this.renderText(scene, track, center, radius, lineWidth);
  }

  private renderCircle(
    scene: any,
    track: Track,
    center: WorldPoint,
    radius: number,
    backgroundColour: number,
  ) {
    const THREE = Scene.THREE;
    const geometry = new THREE.CircleGeometry(radius, SongCircle.DEGREES_IN_CIRCLE);
    let material;

    if (backgroundColour === null) {
      const texture = new THREE.TextureLoader().load(track.getBestImageURL());

      material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, map: texture });
    } else {
      material = new THREE.MeshBasicMaterial({ color: backgroundColour });
    }

    const circle = new THREE.Mesh(geometry, material);
    circle.position.set(center.x, center.y, center.z);

    scene.add(circle);
  }

  private renderCircleOutline(
    scene: Scene,
    center: WorldPoint,
    radius: number,
    lineWidth: number,
  ) {
    const THREE = Scene.THREE;
    const geometry = new THREE.Geometry();

    for (let i = 0; i <= SongCircle.DEGREES_IN_CIRCLE; i += SongCircle.CIRCLE_RESOLUTION) {
      const numberOfVertices = 4;
      const nextVertexCount = i * numberOfVertices;
      const theta = conversions.degreesToRadians(nextVertexCount);

      const inner = new THREE.Vector3(Math.cos(theta) * radius + center.x,
                                      Math.sin(theta) * radius + center.y,
                                      center.z);
      const outer = new THREE.Vector3(Math.cos(theta) * (radius + lineWidth) + center.x,
                                      Math.sin(theta) * (radius + lineWidth) + center.y,
                                      center.z);

      const previousVertex2 = geometry.vertices[geometry.vertices.length - 2] || inner;
      const previousVertex1 = geometry.vertices[geometry.vertices.length - 1] || outer;

      geometry.vertices.push(
        previousVertex2, previousVertex1, inner,
        previousVertex1, inner, outer);
      geometry.faces.push(
        new THREE.Face3(nextVertexCount, nextVertexCount + 1, nextVertexCount + 2),
        new THREE.Face3(nextVertexCount + 1, nextVertexCount + 2, nextVertexCount + 3),
      );
    }

    const material = new THREE.MeshBasicMaterial({ color: 0x2F3640 });
    const circleOutline = new THREE.Mesh(geometry, material);
    circleOutline.drawMode = THREE.TriangleStripDrawMode;

    scene.add(circleOutline);
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
      let predictedWidth = null;
      let text = null;

      function generateText(fontSize: number) {
        const geometry = new THREE.TextGeometry(track.getName(), {
          font,
          size: fontSize,
          height: 0,
          curveSegments: 4,
        });
        geometry.center();

        const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const text = new THREE.Mesh(geometry, material);

        return text;
      }

      const circumference = radius * 2;
      const padding = lineWidth * 4;

      while (!predictedWidth || predictedWidth > circumference - padding) {
        fontSize -= 0.025;
        text = generateText(fontSize);

        const box = new THREE.Box3().setFromObject(text);
        predictedWidth = box.getSize().x;
      }

      text.position.set(center.x, center.y, center.z + 0.00002);

      scene.add(text);
    });
  }

  public getRadius(): number {
    return this.radius;
  }

  public getLineWidth(): number {
    return this.lineWidth;
  }

  public getCenter(): WorldPoint {
    return this.center;
  }

  public getTrack(): Track {
    return this.track;
  }
}

export default SongCircle;
