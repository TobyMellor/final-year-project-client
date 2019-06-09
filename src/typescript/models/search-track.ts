import { Input as ImageInput } from './Image';
import { SearchTrack } from '../types/spotify-responses';

export type RemoteTrack = {
  id: string;
  images: ImageInput[];
  name: string;
  durationMs: number;
};

class SearchTrackModel {
  private _tracks: SearchTrack[];

  constructor(tracks: SearchTrack[]) {
    this._tracks = tracks;
  }

  private sanitizeTrack(track: SearchTrack) {
    return {
      id: track.id,
      images: track.album.images,
      name: track.name,
      durationMs: track.duration_ms,
    };
  }

  public get tracks() {
    const tracks: RemoteTrack[] = this._tracks.map((track: SearchTrack) => this.sanitizeTrack(track));
    return tracks;
  }

  public getTrackByID(ID: string) {
    const track = this._tracks.find(track => track.id === ID);
    return this.sanitizeTrack(track);
  }
}

export default SearchTrackModel;
