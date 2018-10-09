export type Input = {
  vertices: number[];
  colours: number[];
  textureURL: string;
};
export type InputBatch = Input[];

export interface DrawInformation {
  vertexBuffer: WebGLBuffer;
  colourBuffer: WebGLBuffer;
  vertices: number[];
  textureInformation: {
    texture: WebGLTexture,
    textureCoordsBuffer: WebGLBuffer,
  };
}

class Drawable {
  // How many degrees we need to rotate circles so "0%" appears at the top
  private static OFFSET_AMOUNT_DEGREES: number = 90;

  protected drawInformationBatch: DrawInformation[];

  public getDrawInformationBatch(): DrawInformation[] {
    return this.drawInformationBatch;
  }

  private getDrawInformationFromInput(
    gl: WebGLRenderingContext,
    drawInformationInput: Input,
  ): DrawInformation {
    const { vertices, colours, textureURL } = drawInformationInput;

    const vertexBuffer: WebGLBuffer = this.createBuffer(gl, vertices);
    const colourBuffer: WebGLBuffer = this.createBuffer(gl, colours);

    const texture: WebGLTexture = this.createTexture(gl, textureURL);

    const radius = 10;
    const lineWidth = 0.5;

    const textureCoordsBuffer: WebGLBuffer = this.createBuffer(gl, vertices.map(
      (vertex: number) => {
        return ((vertex) / ((radius + lineWidth) * 2) + 0.5);
      },
    ));

    return {
      vertexBuffer,
      colourBuffer,
      vertices,
      textureInformation: {
        texture,
        textureCoordsBuffer,
      },
    };
  }

  protected setDrawInformationBatch(
    gl: WebGLRenderingContext,
    inputBatch: InputBatch,
  ) {
    const output: DrawInformation[] = inputBatch.map((input: Input) => {
      return this.getDrawInformationFromInput(gl, input);
    });

    this.drawInformationBatch = output;
  }

  private createBuffer(gl: WebGLRenderingContext, array: number[]): WebGLBuffer {
    const buffer: WebGLBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER,
                  new Float32Array(array),
                  gl.STATIC_DRAW);

    return buffer;
  }

  private createTexture(gl: WebGLRenderingContext, textureURL: string): WebGLTexture {
    const texture: WebGLTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because images have to be download over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 255, 255, 255]);  // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  width, height, border, srcFormat, srcType,
                  pixel);

    const image = new Image();
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    srcFormat, srcType, image);

      // WebGL1 has different requirements for power of 2 images
      // vs non power of 2 images so check if the image is a
      // power of 2 in both dimensions.
      if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
        console.log(image.width);
        console.log(image.height);
        // gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        // Prevents s-coordinate wrapping (repeating).
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        // Prevents t-coordinate wrapping (repeating).
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // Yes, it's a power of 2. Generate mips.
        gl.generateMipmap(gl.TEXTURE_2D);
      } else {
        // No, it's not a power of 2. Turn of mips and set
        // wrapping to clamp to edge
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      }
    };
    image.src = textureURL;

    return texture;
  }

  isPowerOf2(value: number) {
    return (value & (value - 1)) === 0;
  }

  static convert(number: number, conversionFn: (number: number) => number) {
    return conversionFn(number);
  }

  static degreesToRadiansFn(degrees: number) {
    const radians = degrees * (Math.PI / 180);

    return radians % (2 * Math.PI);
  }

  static radiansToDegreesFn(radians: number) {
    const degrees = radians * (180 / Math.PI);

    return degrees % 360;
  }

  static percentageToDegreesFn(percentage: number) {
    const decimal = percentage / 100;

    // Inverse so percentage is clockwise, to make
    // 25% appear on the right of the circle instead of the left
    const inversedDecimal = 1 - decimal;
    const degrees = inversedDecimal * 360;

    // How many degrees we need to rotate circles so "0%" appears at the top
    const degreesOffset = degrees + Drawable.OFFSET_AMOUNT_DEGREES;

    return degreesOffset % 360;
  }

  static percentageToRadiansFn(percentage: number) {
    const degrees = Drawable.convert(percentage, Drawable.percentageToDegreesFn);
    const radians = Drawable.convert(degrees, Drawable.degreesToRadiansFn);

    return radians;
  }
}

export default Drawable;
