/**
 * Initial Canvas/WebGL Setup
 */

import vertexShaderSource from './shaders/vertex-shader-source';
import fragmentShaderSource from './shaders/fragment-shader-source';
import SongCircle from './drawables/SongCircle';
import { DrawInformation } from './drawables/Drawable';
import DrawableBuilder from './drawables/utils/DrawableBuilder';
import Point from './drawables/utils/Point';
import Scene from './drawables/Scene';

export interface ProgramInfo {
  program: WebGLProgram;
  attribLocations: {
    vertexPosition: number,
    textureCoord: number,
  };
  uniformLocations: {
    projectionMatrix: WebGLUniformLocation,
    cameraMatrix: WebGLUniformLocation,
    uSampler: WebGLUniformLocation,
  };
  drawInformationBatch: DrawInformation[];
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
      textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      cameraMatrix: gl.getUniformLocation(shaderProgram, 'uCameraMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
    },
    drawInformationBatch: [],
  };

  const circle1Radius = 10;
  const circle1LineWidth = 1;

  const circle1 = new SongCircle(gl,
                                 Point.getPoint(0, 0),
                                 circle1Radius,
                                 circle1LineWidth);

  const circle2Radius = 8;
  const circle2LineWidth = 0.7;
  const circle2Percentage = 25;

  const circle2 = new SongCircle(gl,
                                 Point.getPointOnCircleFromPercentage(circle1,
                                                                      circle2Percentage,
                                                                      circle2Radius,
                                                                      circle2LineWidth),
                                 circle2Radius,
                                 circle2LineWidth);

  // Build the objects we need to draw
  const drawInformationBatch: DrawInformation[] = new DrawableBuilder()
    .add(circle1.getDrawInformationBatch())
    .add(circle2.getDrawInformationBatch())
    .build();

  // Draw the scene repeatedly
  function render(now: number) {
    new Scene(gl, programInfo, drawInformationBatch);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

function resizeCanvas(gl: WebGLRenderingContext) {

  // How many of the screen's actual pixels should be drawn for each CSS pixel
  const physicalToCSSPixels: number = window.devicePixelRatio;

  // Lookup the size the browser is displaying the canvas in CSS pixels
  // and compute a size needed to make our drawingbuffer match it in
  // device pixels
  const displayWidth: number = Math.floor(gl.canvas.clientWidth * physicalToCSSPixels);
  const displayHeight: number = Math.floor(gl.canvas.clientHeight * physicalToCSSPixels);

  if (gl.canvas.width  !== displayWidth ||
      gl.canvas.height !== displayHeight) {

    gl.canvas.width = displayWidth;
    gl.canvas.height = displayHeight;
  }

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
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
