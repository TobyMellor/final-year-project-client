import Track from '../../../models/Track';
import WorldPoint from '../../canvas/drawables/points/WorldPoint';
import Scene from './Scene';
import * as conversions from './utils/conversions';

export type Drawable = {
  meshes: THREE.Mesh[];
};

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

  private drawable: Drawable = null;

  constructor(
    THREE: any,
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
    center.z = Scene.Z_BASE_DISTANCE - track.getDurationMs() / oneTrillion;

    const circle = this.getCircle(THREE, track, center, radius, backgroundColour);
    const circleOutline = this.getCircleOutline(THREE, center, radius, lineWidth);

    this.drawable = {
      meshes: [circle, circleOutline],
    };
  }

  private getCircle(
    THREE: any,
    track: Track,
    center: WorldPoint,
    radius: number,
    backgroundColour: number,
  ): THREE.Mesh {
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

    return circle;
  }

  private getCircleOutline(
    THREE: any,
    center: WorldPoint,
    radius: number,
    lineWidth: number,
  ): THREE.Mesh {
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
    const mesh = new THREE.Mesh(geometry, material);
    mesh.drawMode = THREE.TriangleStripDrawMode;

    return mesh;
  }

  public getDrawable() {
    return this.drawable;
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
