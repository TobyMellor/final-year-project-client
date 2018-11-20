import Album, { Input as AlbumInput } from '../Album';
import AudioFeatures from '../audio-features/AudioFeatures';
import AudioAnalysis from './AudioAnalysis';

export type Input = {
  album: Album | AlbumInput;
  audioFeatures?: AudioFeatures;
  audioAnalysis?: AudioAnalysis;
  duration_ms: number;
  explicit: boolean;
  id: string;
  name: string;
  uri: string;
};

class Track {
  private album: Album;
  private audioFeatures: AudioFeatures | null; // Loaded in when it becomes parent song
  private audioAnalysis: AudioAnalysis | null; // ditto ^
  private durationMs: number;
  private explicit: boolean;
  private ID: string;
  private name: string;
  private URI: string;

  constructor({
    album,
    audioFeatures,
    audioAnalysis,
    duration_ms,
    explicit,
    id,
    name,
    uri,
  }: Input) {
    this.album = album instanceof Album ? album : new Album(album);
    this.audioFeatures = audioFeatures || null;
    this.audioAnalysis = audioAnalysis || null;
    this.durationMs = duration_ms;
    this.explicit = explicit;
    this.ID = id;
    this.name = name;
    this.URI = uri;
  }

  public getAlbum() {
    return this.album;
  }

  public getAudioFeatures() {
    return this.audioFeatures;
  }

  public setAudioFeatures(audioFeatures: AudioFeatures) {
    this.audioFeatures = audioFeatures;
  }

  public getAudioAnalysis() {
    return this.audioAnalysis;
  }

  public setAudioAnalysis(audioAnalysis: AudioAnalysis) {
    this.audioAnalysis = audioAnalysis;
  }

  public getDurationMs() {
    return this.durationMs;
  }

  public isExplicit() {
    return this.explicit;
  }

  public getBestImageURL(): string | null {
    const album = this.album;
    const images = album.getImages();

    if (images.length > 0) {
      return images[0].getUrl();
    }

    return null;
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
