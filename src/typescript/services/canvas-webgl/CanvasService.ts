/**
 * Initial Canvas/WebGL Setup
 */

import vertexShaderSource from './shaders/vertex-shader-source';
import fragmentShaderSource from './shaders/fragment-shader-source';
import SongCircle from './drawables/SongCircle';
import { DrawInformation } from './drawables/Drawable';
import DrawableBuilder from './drawables/utils/DrawableBuilder';
import Scene from './drawables/Scene';
import Translator from '../../../translations/Translator';
import Dispatcher from '../../events/Dispatcher';
import Track from '../../models/audio-analysis/Track';
import * as DrawableFactory from './drawables/drawable-factory';
import * as conversions from './drawables/utils/conversions';

export interface ProgramInfo {
  program: WebGLProgram;
  attribLocations: {
    vertexPosition: number,
    textureCoord: number,
    textureOverlay: number,
  };
  uniformLocations: {
    projectionMatrix: WebGLUniformLocation,
    cameraMatrix: WebGLUniformLocation,
    uSampler: WebGLUniformLocation,
  };
  drawInformationBatch: DrawInformation[];
}

class CanvasService {
  private static _instance: CanvasService = null;

  private drawInformationBatch: DrawInformation[] = [];
  private gl: WebGLRenderingContext;
  private programInfo: ProgramInfo;

  private parentSongCircle: SongCircle = null;
  private childSongCircles: SongCircle[] = [];

  private constructor(canvas: HTMLCanvasElement) {
    const gl = this.gl = canvas.getContext('webgl');

    this.resizeCanvas();

    if (!gl) {
      alert(Translator.setup.init_webgl_failed); return;
    }

    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established
    const shaderProgram: WebGLProgram = this.initShaderProgram(vertexShaderSource,
                                                               fragmentShaderSource);

    // Collect all the info needed to use the shader program
    this.programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aModelMatrix'),
        textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
        textureOverlay: gl.getAttribLocation(shaderProgram, 'aTextureOverlay'),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
        cameraMatrix: gl.getUniformLocation(shaderProgram, 'uCameraMatrix'),
        uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
      },
      drawInformationBatch: [],
    };

    Dispatcher.getInstance().on('PlayingTrackChanged', this, this.setSongCircles);

    const render = (now: number) => {
      new Scene(this.gl, this.programInfo, this.drawInformationBatch);

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  }

  public static getInstance(canvas?: HTMLCanvasElement): CanvasService {
    if (this._instance) {
      return this._instance;
    }

    if (!canvas) {
      alert(Translator.setup.canvas_not_yet_initialised); return null;
    }

    return this._instance = new this(canvas);
  }

  public getParentSongCircle(): SongCircle {
    return this.parentSongCircle;
  }

  public setSongCircles(
    { playingTrack, childTracks }: { playingTrack: Track, childTracks: Track[] },
  ) {
    const parentSongCircle = DrawableFactory.createParentSongCircle(playingTrack);
    const childSongCircles = childTracks.map((childTrack) => {
      const percentage = Math.round(Math.random() * 100);

      return DrawableFactory.createChildSongCircle(parentSongCircle, childTrack, percentage);
    });
    const allSongCircles = [parentSongCircle, ...childSongCircles];
    const drawInformationBatch: DrawInformation[] = [];

    allSongCircles.forEach((songCircle) => {
      drawInformationBatch.push(...songCircle.getDrawInformationBatch());
    });

    this.parentSongCircle = parentSongCircle;
    this.childSongCircles = childSongCircles;
    this.drawInformationBatch = drawInformationBatch;
  }

  public getGL(): WebGLRenderingContext {
    return this.gl;
  }

  public setDrawInformationBatch(drawableBuilder: DrawableBuilder) {
    this.drawInformationBatch = drawableBuilder.build();
  }

  private resizeCanvas() {
    const gl = this.gl;

    // How many of the screen's actual pixels should be drawn for each CSS pixel
    const physicalToCSSPixels = window.devicePixelRatio;

    // Lookup the size the browser is displaying the canvas in CSS pixels
    // and compute a size needed to make our drawingbuffer match it in
    // device pixels
    const displayWidth = Math.floor(gl.canvas.clientWidth * physicalToCSSPixels);
    const displayHeight = Math.floor(gl.canvas.clientHeight * physicalToCSSPixels);

    if (gl.canvas.width  !== displayWidth ||
        gl.canvas.height !== displayHeight) {

      gl.canvas.width = displayWidth;
      gl.canvas.height = displayHeight;
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  }

  private initShaderProgram(
    vsSource: string,
    fsSource: string,
  ): WebGLProgram | null {
    const gl = this.gl;
    const vertexShader: WebGLShader = this.loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader: WebGLShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);
    const shaderProgram: WebGLProgram = gl.createProgram();

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert(`${Translator.setup.init_shader_failed} ${gl.getProgramInfoLog(shaderProgram)}`);
      return null;
    }

    return shaderProgram;
  }

  private loadShader(
    type: number,
    source: string,
  ): WebGLShader | null {
    const gl = this.gl;
    const shader: WebGLShader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(`${Translator.setup.compile_shader_failed} ${gl.getShaderInfoLog(shader)}`);
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }
}

export default CanvasService;
