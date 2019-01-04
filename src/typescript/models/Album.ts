import ImageModel, { Input as ImageInput } from './Image';

export type Input = {
  id: string;
  images: ImageInput[];
  name: string;
  uri: string;
};

class AlbumModel {
  private _ID: string;           // The Spotify ID for the album
  private _images: ImageModel[]; // The cover art for the album in various sizes, widest first
  private _name: string;         // The name of the album
  private _URI: string;          // The Spotify URI for the album

  constructor({ id, images, name, uri }: Input) {
    this._ID = id;
    this._images = images.map(image => new ImageModel(image));
    this._name = name;
    this._URI = uri;
  }

  public get ID() {
    return this._ID;
  }

  public get images() {
    return this._images;
  }

  public get name() {
    return this._name;
  }

  public get URI() {
    return this._URI;
  }
}

export default AlbumModel;
