export type Input = {
  id: string;
  images: string[];
  name: string;
  uri: string;
};

class Artist {
  private ID: string;   // The Spotify ID for the artist
  private images: string[];
  private name: string;
  private URI: string;

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

export default Artist;
