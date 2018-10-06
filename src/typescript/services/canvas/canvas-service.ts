import * as glMatrix from 'gl-matrix';
import vertexShaderSource from './shaders/vertex-shader-source';
import fragmentShaderSource from './shaders/fragment-shader-source';

const mat4 = glMatrix.mat4;

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

interface DrawInformation {
  vertexBuffer: WebGLBuffer;
  vertices: number[];
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

  // Build the objects we need to draw
  const drawInformation: DrawInformation = getDrawInformation(gl);

  // Draw the scene
  drawCircle(gl, programInfo, drawInformation);
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

function getDrawInformation(gl: WebGLRenderingContext): DrawInformation {
  const vertexBuffer: WebGLBuffer = gl.createBuffer();
  const vertices: number[] = [];

  for (let i = 0.0; i <= 360; i += 1) {
    const j = convertAngle(i, toRadiansFn); // Degrees to radians

    // Point of line furthest from center (the edge of the circle)
    const vertex1 = [
      Math.sin(j),
      Math.cos(j),
    ];

    // Point of line closest to center (center of the circle)
    const vertex2 = [
      Math.sin(j) * 0.9,
      Math.cos(j) * 0.9,
    ];

    vertices.push(...vertex1, ...vertex2);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
                new Float32Array(vertices),
                gl.STATIC_DRAW);

  return {
    vertexBuffer,
    vertices,
  };
}

function drawCircle(
  gl: WebGLRenderingContext,
  programInfo: ProgramInfo,
  drawInformation: DrawInformation,
) {
  gl.clearColor(1.0, 1.0, 1.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a projection matrix that allows us to tweak the cameras
  // field of view, and whether circles will be rendered out of view
  const fieldOfView = convertAngle(45, toRadiansFn);
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
                 [0.0, 0.0, -3.0]); // amount to translate

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;

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
  }

  gl.useProgram(programInfo.program);

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.cameraMatrix,
      false,
      cameraMatrix);

  const offset = 0;
  const stripVertexCount = drawInformation.vertices.length / 2;

  gl.drawArrays(gl.TRIANGLE_STRIP, offset, stripVertexCount);
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

function convertAngle(angle: number, conversionFn: (angle: number) => number) {
  return conversionFn(angle);
}

function toRadiansFn(degrees: number) {
  return degrees * (Math.PI / 180);
}

function toDegreesFn(radians: number) {
  return radians * (180 / Math.PI);
}
