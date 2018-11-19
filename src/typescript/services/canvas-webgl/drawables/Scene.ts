import { mat4 } from 'gl-matrix';
import Drawable, { DrawInformation, TextInformation } from './Drawable';
import { ProgramInfo } from '../CanvasService';
import * as conversions from './utils/conversions';
import Point from './points/Point';

class Scene {
  public static BUFFER_NUM_COMPONENTS: number = 3; // How many dimensions?

  private static BUFFER_TYPE = WebGLRenderingContext.FLOAT;
  private static BUFFER_SHOULD_NORMALIZE: boolean = false;
  private static BUFFER_STRIDE: number = 0;
  private static BUFFER_OFFSET: number = 0;

  private static CAMERA_FOV_DEGREES: number = 45;
  private static CAMERA_Z_CLIP_NEAR: number = 0.1;
  private static CAMERA_Z_CLIP_FAR: number = 100.0;
  public static CAMERA_POSITION: number[] = [0.0, 0.0, -5.0];

  constructor(
    gl: WebGLRenderingContext,
    programInfo: ProgramInfo,
    drawInformationBatch: DrawInformation[],
  ) {
    gl.clearColor(1.0, 1.0, 1.0, 1.0);         // Clear to black, fully opaque
    gl.clearDepth(1.0);                        // Clear everything
    gl.enable(gl.DEPTH_TEST);                  // Enable depth testing
    gl.depthFunc(gl.LEQUAL);                   // Near things obscure far things
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip textures to the correct orientation

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const { uniformLocations, attribLocations } = programInfo;
    const projectionMatrix: mat4 = this.getProjectionMatrix(gl);
    const cameraMatrix: mat4 = this.getCameraMatrix();

    gl.useProgram(programInfo.program);

    this.registerMatrix(gl, projectionMatrix, uniformLocations.projectionMatrix);
    this.registerMatrix(gl, cameraMatrix, uniformLocations.cameraMatrix);

    drawInformationBatch.forEach((drawInformation: DrawInformation) => {
      const stripVertexCount = drawInformation.vertices.length / Scene.BUFFER_NUM_COMPONENTS;

      // Tell WebGL how to pull out the vertex coordinates from
      // the vertex position buffer into the vertexPosition attribute
      this.enableVertexAttribArray(gl,
                                   drawInformation.vertexBuffer,
                                   attribLocations.vertexPosition);

      // Tell WebGL how to pull out the texture coordinates from
      // the texture coordinate buffer into the textureCoord attribute
      this.enableVertexAttribArray(gl,
                                   drawInformation.textureInformation.textureCoordsBuffer,
                                   attribLocations.textureCoord);

      // Tell WebGL how to pull out the texture overlay from
      // the texture overlay buffer into the overlay attribute
      this.enableVertexAttribArray(gl,
                                   drawInformation.textureInformation.textureOverlayBuffer,
                                   attribLocations.textureOverlay);

      this.bindTexture(gl,
                       drawInformation.textureInformation.texture,
                       uniformLocations.uSampler);

      gl.drawArrays(gl.TRIANGLE_STRIP, Scene.BUFFER_OFFSET, stripVertexCount);

      if (drawInformation.textInformation) {

        // console.log(projectionMatrix);

        // divide X and Y by W just like the GPU does.
        // clipspace[0] /= clipspace[3];
        // clipspace[1] /= clipspace[3];

        // // convert from clipspace to pixels
        // var pixelX = (clipspace[0] *  0.5 + 0.5) * gl.canvas.width;
        // var pixelY = (clipspace[1] * -0.5 + 0.5) * gl.canvas.height;

        this.renderText(gl, drawInformation.textInformation, projectionMatrix, cameraMatrix);
      }
    });
  }

  /**
   * Create a projection matrix that allows us to tweak the cameras
   * field of view, and whether circles will be rendered out of view
   */
  private getProjectionMatrix(gl: WebGLRenderingContext): mat4 {
    const cameraFOVRadians = conversions.degreesToRadians(Scene.CAMERA_FOV_DEGREES);
    const aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix,
                     cameraFOVRadians,
                     aspectRatio,
                     Scene.CAMERA_Z_CLIP_NEAR,
                     Scene.CAMERA_Z_CLIP_FAR);

    return projectionMatrix;
  }

  /**
   * Set the drawing position to the "identity" point, which is
   * the center of the scene
   */
  private getCameraMatrix(): mat4 {
    const cameraMatrix = mat4.create();

    // Now move the drawing position a bit to where we want to
    // start drawing the square
    mat4.translate(cameraMatrix,          // destination matrix
                   cameraMatrix,          // matrix to translate
                   Scene.CAMERA_POSITION); // amount to translate

    return cameraMatrix;
  }

  private registerMatrix(
    gl: WebGLRenderingContext,
    matrix: mat4,
    uniformLocation: WebGLUniformLocation,
  ) {
    gl.uniformMatrix4fv(
      uniformLocation,
      false,
      matrix);
  }

  private enableVertexAttribArray(
    gl: WebGLRenderingContext,
    buffer: WebGLBuffer,
    attribLocation: number,
  ) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(attribLocation,
                           Scene.BUFFER_NUM_COMPONENTS,
                           Scene.BUFFER_TYPE,
                           Scene.BUFFER_SHOULD_NORMALIZE,
                           Scene.BUFFER_STRIDE,
                           Scene.BUFFER_OFFSET);
    gl.enableVertexAttribArray(attribLocation);
  }

  private bindTexture(
    gl: WebGLRenderingContext,
    texture: WebGLTexture,
    samplerLocation: WebGLUniformLocation,
  ) {
    // Tell WebGL we want to affect texture unit 0
    gl.activeTexture(gl.TEXTURE0);

    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Tell the shader we bound the texture to texture unit 0
    gl.uniform1i(samplerLocation, 0);
  }

  private renderText(
    gl: WebGLRenderingContext,
    textInformation: TextInformation,
    projectionMatrix: mat4,
    cameraMatrix: mat4,
  ) {
    const container: HTMLElement = document.getElementById('song-descriptions');
    const existingLabels = container.querySelector(
      `div[data-unique-identifier="${textInformation.uniqueIdentifier}"]`,
    );

    if (existingLabels) { return; }

    const {
      containerWorldWidth,
      heading,
      worldPoint,
      uniqueIdentifier,
    } = textInformation;
    const div: HTMLDivElement = document.createElement('div');
    const textNode: Text = document.createTextNode(heading);

    div.appendChild(textNode);
    container.appendChild(div);

    const absolutePoint = worldPoint
      .toClipspacePoint(projectionMatrix, cameraMatrix)
      .toCanvasPoint(gl)
      .toAbsolutePoint(gl);

    const absoluteContainerWidth = conversions.worldWidthToAbsoluteWidth(
      containerWorldWidth,
      gl,
    );

    console.log(absoluteContainerWidth);

    // Make the font smaller than the width of the container
    const fontSize = absoluteContainerWidth / 10;

    div.style.width = `${absoluteContainerWidth}px`;

    div.className = 'song-circle-text';
    div.style.display = 'block';
    div.style.fontSize = `${fontSize}px`;
    div.setAttribute('data-unique-identifier', uniqueIdentifier);

    // Translate so div is centered on the desired point
    absolutePoint.translate(
      -(div.clientWidth / 2),
      -(div.clientHeight / 2),
    );

    div.style.left = `${Math.floor(absolutePoint.x)}px`;
    div.style.top = `${Math.floor(absolutePoint.y)}px`;
  }

  private isOverflown(element: HTMLElement) {
    return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth;
  }
}

export default Scene;
