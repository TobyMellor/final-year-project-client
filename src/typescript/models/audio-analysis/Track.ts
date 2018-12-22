import AlbumModel, { Input as AlbumInput } from '../Album';
import AudioFeaturesModel from '../audio-features/AudioFeatures';
import AudioAnalysisModel from './AudioAnalysis';

export type Input = {
  album: AlbumModel | AlbumInput;
  audioFeatures?: AudioFeaturesModel;
  audioAnalysis?: AudioAnalysisModel;
  duration_ms: number;
  explicit: boolean;
  id: string;
  name: string;
  uri: string;
};

class TrackModel {
  private album: AlbumModel;
  private audioFeatures: AudioFeaturesModel | null; // Loaded in when it becomes parent song
  private audioAnalysis: AudioAnalysisModel | null; // ditto ^
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
    this.album = album instanceof AlbumModel ? album : new AlbumModel(album);
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

  public setAudioFeatures(audioFeatures: AudioFeaturesModel) {
    this.audioFeatures = audioFeatures;
  }

  public getAudioAnalysis() {
    return this.audioAnalysis;
  }

  public setAudioAnalysis(audioAnalysis: AudioAnalysisModel) {
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

export default TrackModel;
