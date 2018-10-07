import * as glMatrix from 'gl-matrix';
import vertexShaderSource from './shaders/vertex-shader-source';
import fragmentShaderSource from './shaders/fragment-shader-source';
import Drawable, { DrawInformation } from './Drawable';
import SongCircle from './SongCircle';
import DrawableBuilder from './DrawableBuilder';
import Point from './Point';

const mat4 = glMatrix.mat4;

console.log(new Point(1, 1));

interface ProgramInfo {
  program: WebGLProgram;
  attribLocations: {
    vertexPosition: number,
  };
  uniformLocations: {
    projectionMatrix: WebGLUniformLocation,
    cameraMatrix: WebGLUniformLocation,
  };
}

export function startCanvasService(canvas: HTMLCanvasElement) {
  const gl: WebGLRenderingContext = canvas.getContext('webgl');
  resizeCanvas(gl);

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established
  const shaderProgram: WebGLProgram = initShaderProgram(gl,
                                                        vertexShaderSource,
                                                        fragmentShaderSource);

  // Collect all the info needed to use the shader program
  const programInfo: ProgramInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aModelMatrix'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      cameraMatrix: gl.getUniformLocation(shaderProgram, 'uCameraMatrix'),
    },
  };

  const circle1Radius = 10;
  const circle1LineWidth = 0.5;

  const circle1 = new SongCircle(gl,
                                 Point.getPoint(0, 0),
                                 circle1Radius,
                                 circle1LineWidth);

  const circle2Radius = 0.9;
  const circle2LineWidth = 0.9;
  const circle2Percentage = 25;

  const circle2 = new SongCircle(gl,
                                 Point.getPointOnCircleFromPercentage(circle1,
                                                                      circle2Percentage,
                                                                      circle1Radius / 2,
                                                                      circle1LineWidth),
                                 5,
                                 circle2LineWidth);

  // Build the objects we need to draw
  const drawInformationBatch: DrawInformation[] = new DrawableBuilder()
    .add(circle1.getDrawInformation())
    .add(circle2.getDrawInformation())
    .build();

  // Draw the scene
  drawScene(gl, programInfo, drawInformationBatch);
}

function resizeCanvas(gl: WebGLRenderingContext) {

  // How many of the screen's actual pixels should be drawn for each CSS pixel
  const physicalToCSSPixels: number = window.devicePixelRatio;

  // Lookup the size the browser is displaying the canvas in CSS pixels
  // and compute a size needed to make our drawingbuffer match it in
  // device pixels
  const displayWidth: number  = Math.floor(gl.canvas.clientWidth * physicalToCSSPixels);
  const displayHeight: number = Math.floor(gl.canvas.clientHeight * physicalToCSSPixels);

  if (gl.canvas.width  !== displayWidth ||
      gl.canvas.height !== displayHeight) {

    gl.canvas.width  = displayWidth;
    gl.canvas.height = displayHeight;
  }

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

function drawScene(
  gl: WebGLRenderingContext,
  programInfo: ProgramInfo,
  drawInformationBatch: DrawInformation[],
) {
  gl.clearColor(1.0, 1.0, 1.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a projection matrix that allows us to tweak the cameras
  // field of view, and whether circles will be rendered out of view
  const fieldOfView = Drawable.convert(45, Drawable.degreesToRadiansFn);
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene
  const cameraMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.

  mat4.translate(cameraMatrix,      // destination matrix
                 cameraMatrix,      // matrix to translate
                 [0.0, 0.0, -60.0]); // amount to translate

  gl.useProgram(programInfo.program);

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.cameraMatrix,
      false,
      cameraMatrix);

  const numComponents = 2;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;

  drawInformationBatch.forEach((drawInformation: DrawInformation) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, drawInformation.vertexBuffer);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);

    gl.enableVertexAttribArray(
      programInfo.attribLocations.vertexPosition);

    const stripVertexCount = drawInformation.vertices.length / 2;

    gl.drawArrays(gl.TRIANGLE_STRIP, offset, stripVertexCount);
  });
}

function initShaderProgram(
  gl: WebGLRenderingContext,
  vsSource: string,
  fsSource: string,
): WebGLProgram | null {
  const vertexShader: WebGLShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader: WebGLShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const shaderProgram: WebGLProgram = gl.createProgram();

  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
    return null;
  }

  return shaderProgram;
}

function loadShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader: WebGLShader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
