export interface DrawInformation {
  vertexBuffer: WebGLBuffer;
  vertices: number[];
}

class Drawable {
  protected drawInformation: DrawInformation;

  getDrawInformation(): DrawInformation {
    return this.drawInformation;
  }

  setDrawInformation(gl: WebGLRenderingContext, vertices: number[]) {
    const vertexBuffer: WebGLBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,
                  new Float32Array(vertices),
                  gl.STATIC_DRAW);

    this.drawInformation = {
      vertices,
      vertexBuffer,
    };
  }

  static convert(number: number, conversionFn: (number: number) => number) {
    return conversionFn(number);
  }

  static degreesToRadiansFn(degrees: number) {
    return degrees * (Math.PI / 180);
  }

  static radiansToDegreesFn(radians: number) {
    return radians * (180 / Math.PI);
  }

  static percentageToDegreesFn(percentage: number) {
    return percentage * 360;
  }

  static percentageToRadiansFn(percentage: number) {
    const degrees = Drawable.convert(percentage, Drawable.percentageToDegreesFn);
    const radians = Drawable.convert(degrees, Drawable.degreesToRadiansFn);

    return radians;
  }
}

export default Drawable;
