import ImageModel, { Input as ImageInput } from './Image';

export type Input = {
  id: string;
  images: ImageInput[];
  name: string;
  uri: string;
};

class AlbumModel {
  private ID: string;           // The Spotify ID for the album
  private images: ImageModel[]; // The cover art for the album in various sizes, widest first
  private name: string;         // The name of the album
  private URI: string;          // The Spotify URI for the album

  constructor({ id, images, name, uri }: Input) {
    this.ID = id;
    this.images = images.map(image => new ImageModel(image));
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

export default AlbumModel;
