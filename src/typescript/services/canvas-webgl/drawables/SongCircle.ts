import Drawable, { Input as DrawableInput } from './Drawable';
import Track from '../../../models/audio-analysis/Track';
import Circle from './utils/Circle';
import WorldPoint from './points/WorldPoint';

class SongCircle extends Drawable {
  private static WHITE_COLOUR: Uint8Array = new Uint8Array([255, 255, 255, 255]);
  private static BLACK_COLOUR: Uint8Array = new Uint8Array([0, 0, 0, 255]);
  private static TRANSPARENT_OVERLAY: number[] = [1, 1, 1, 1]; // Colour to overlay textures with
  private static DARKEN_OVERLAY: number[] = [0.4, 0.4, 0.4, 1];

  private radius: number;
  private lineWidth: number;
  private center: WorldPoint;

  private track: Track;

  constructor(
    track: Track,
    gl: WebGLRenderingContext,
    center: WorldPoint,
    radius: number,
    lineWidth: number,
    backgroundColour?: Uint8Array,
    textureOverlayVector?: number[],
  ) {
    super();

    this.track = track;
    this.center = center;
    this.radius = radius;
    this.lineWidth = lineWidth;

    // Make smaller circles (songs with a smaller durations) appear in front
    // So, give smaller circles a smaller Z
    // One trillion isn't special here, it's just making Z small
    const oneTrillion = 1000000000;
    center.z = 1 - track.duration.ms / oneTrillion;

    const isParentSongCircle: boolean = center.x === 0 && center.y === 0;
    const circleDrawableInput = this.getDrawableInput(gl,
                                                      new Circle(center,
                                                                 0,
                                                                 radius),
                                                      backgroundColour || track.bestImageURL,
                                                      textureOverlayVector,
                                                      !isParentSongCircle ? track : null);
    const circleEdgeDrawableInput = this.getDrawableInput(gl,
                                                          new Circle(center,
                                                                     radius,
                                                                     radius + lineWidth),
                                                          SongCircle.BLACK_COLOUR,
                                                          textureOverlayVector);

    super.setDrawInformationBatch(gl, [
      circleDrawableInput,
      circleEdgeDrawableInput,
    ]);
  }

  private getDrawableInput(
    gl: WebGLRenderingContext,
    circle: Circle,
    texture: string | Uint8Array,
    textureOverlayVector?: number[],
    trackForLabelling?: Track,
  ): DrawableInput {
    const vertices: number[] = circle.generateVertices();

    const drawableInput: DrawableInput = {
      vertices,
      texture,
      textureOverlayVector: textureOverlayVector || SongCircle.DARKEN_OVERLAY,
      songCircle: this,
    };

    if (trackForLabelling) {
      const { ID, name, album } = trackForLabelling;

      drawableInput.textInformation = {
        heading: name,
        subheading: album.name,
        worldPoint: this.center,
        containerWorldWidth: circle.getCircumference(),
        uniqueIdentifier: ID,
      };
    }

    return drawableInput;
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
