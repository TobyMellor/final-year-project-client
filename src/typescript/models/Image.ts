export type Input = {
  height: number;
  url: string;
  width: number;
};

class Image {
  private height: number;
  private url: string;
  private width: number;

  constructor({ height, url, width }: Input) {
    this.height = height;
    this.url = url;
    this.width = width;
  }

  public getHeight() {
	  return this.height;
  }

  public getUrl() {
    return this.url;
  }

  public getWidth() {
    return this.width;
  }
}

export default Image;
