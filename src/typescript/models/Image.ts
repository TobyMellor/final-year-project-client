export type Input = {
  height: number;
  url: string;
  width: number;
};

class ImageModel {
  private _height: number;
  private _URL: string;
  private _width: number;

  constructor({ height, url, width }: Input) {
    this._height = height;
    this._URL = url;
    this._width = width;
  }

  public get height() {
    return this._height;
  }

  public get URL() {
    return this._URL;
  }

  public get width() {
    return this._width;
  }
}

export default ImageModel;
