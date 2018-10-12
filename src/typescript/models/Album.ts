export type Input = {
  id: string;
  images: string[];
  name: string;
  uri: string;
};

class Album {
  private ID: string;       // The Spotify ID for the album
  private images: string[]; // The cover art for the album in various sizes, widest first
  private name: string;     // The name of the album
  private URI: string;      // The Spotify URI for the album

  constructor({ id, images, name, uri }: Input) {
    this.ID = id;
    this.images = images;
    this.name = name;
    this.URI = uri;
  }

  public getID() {
    return this.ID;
  }

  public getImages() {
    return this.images;
  }

  public getName() {
    return this.name;
  }

  public getURI() {
    return this.URI;
  }
}

export default Album;
