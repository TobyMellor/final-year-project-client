import Album from './Album';
import Artist from './Artist';
import AudioFeatures from './AudioFeatures';

export type Input = {
  album: Album;
  artist: Artist;
  audioFeatures: AudioFeatures;
  duration_ms: number;
  explicit: boolean;
  id: string;
  name: string;
  uri: string;
};

class Track {
  private album: Album;
  private artist: Artist;
  private audioFeatures: AudioFeatures;
  private durationMs: number;
  private explicit: boolean;
  private ID: string;
  private name: string;
  private URI: string;

  constructor({ album, artist, audioFeatures, duration_ms, explicit, id, name, uri }: Input) {
    this.album = album;
    this.artist = artist;
    this.audioFeatures = audioFeatures;
    this.durationMs = duration_ms;
    this.explicit = explicit;
    this.ID = id;
    this.name = name;
    this.URI = uri;
  }

  public getAlbum() {
    return this.album;
  }

  public getArtist() {
    return this.artist;
  }

  public getAudioFeatures() {
    return this.audioFeatures;
  }

  public getDurationMs() {
    return this.durationMs;
  }

  public isExplicit() {
    return this.explicit;
  }

  public getID() {
    return this.ID;
  }

  public getName() {
    return this.name;
  }

  public getURI() {
    return this.URI;
  }
}

export default Track;
