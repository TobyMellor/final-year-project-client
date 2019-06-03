import ImageModel, { Input as ImageInput } from './Image';
import { Track } from '../types/spotify-responses';

export type OutputTrack = {
  id: string;
  images: ImageInput[];
  name: string;
  duration: string;
};

class SearchTrackModel {
  private _tracks: Track[];

  constructor(tracks: Track[]) {
    this._tracks = tracks;
  }

  private sanitizeTrack(track: Track) {
    return {
      id: track.id,
      images: track.album.images,
      name: track.name,
      duration: track.duration_ms,
    };
  }

  public get tracks() {
    const tracks: OutputTrack[] = this._tracks.map((track: Track) => this.sanitizeTrack(track));
    return tracks;
  }

  public getTrackByID(ID: string) {
    const track: Track = this._tracks.find(track => track.id === ID);
    return this.sanitizeTrack(track);
  }
}

export default SearchTrackModel;