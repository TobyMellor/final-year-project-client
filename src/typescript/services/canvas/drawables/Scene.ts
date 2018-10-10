import { mat4 } from 'gl-matrix';
import Drawable, { DrawInformation } from './Drawable';
import { ProgramInfo } from '../main';

class Scene {
  private BUFFER_NUM_COMPONENTS: number = 2;
  private BUFFER_TYPE = WebGLRenderingContext.FLOAT;
  private BUFFER_SHOULD_NORMALIZE: boolean = false;
  private BUFFER_STRIDE: number = 0;
  private BUFFER_OFFSET: number = 0;

  private CAMERA_FOV_DEGREES: number = 45;
  private CAMERA_Z_CLIP_NEAR: number = 0.1;
  private CAMERA_Z_CLIP_FAR: number = 100.0;
  private CAMERA_POSITION: number[] = [0.0, 0.0, -30.0];

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
      const stripVertexCount = drawInformation.vertices.length / 2;

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

      this.bindTexture(gl,
                       drawInformation.textureInformation.texture,
                       uniformLocations.uSampler);

      gl.drawArrays(gl.TRIANGLE_STRIP, this.BUFFER_OFFSET, stripVertexCount);
    });
  }

  /**
   * Create a projection matrix that allows us to tweak the cameras
   * field of view, and whether circles will be rendered out of view
   */
  private getProjectionMatrix(gl: WebGLRenderingContext): mat4 {
    const cameraFOVRadians = Drawable.convert(this.CAMERA_FOV_DEGREES, Drawable.degreesToRadiansFn);
    const aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix,
                     cameraFOVRadians,
                     aspectRatio,
                     this.CAMERA_Z_CLIP_NEAR,
                     this.CAMERA_Z_CLIP_FAR);

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
                   this.CAMERA_POSITION); // amount to translate

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
                           this.BUFFER_NUM_COMPONENTS,
                           this.BUFFER_TYPE,
                           this.BUFFER_SHOULD_NORMALIZE,
                           this.BUFFER_STRIDE,
                           this.BUFFER_OFFSET);
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
}

export default Scene;
