export interface DrawInformation {
  vertexBuffer: WebGLBuffer;
  vertices: number[];
}

class Drawable {
  // How many degrees we need to rotate circles so "0%" appears at the top
  private static OFFSET_AMOUNT_DEGREES: number = 90;

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
