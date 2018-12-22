import AlbumModel, { Input as AlbumInput } from '../Album';
import AudioFeaturesModel from '../audio-features/AudioFeatures';
import AudioAnalysisModel from './AudioAnalysis';
import BranchModel from '../branches/Branch';
import * as trackFactory from '../../factories/track';

export type Input = {
  album: AlbumModel | AlbumInput;
  audioFeatures?: AudioFeaturesModel;
  audioAnalysis?: AudioAnalysisModel;
  branches?: BranchModel[];
  duration_ms: number;
  explicit: boolean;
  id: string;
  name: string;
  uri: string;
};

class TrackModel {
  private album: AlbumModel;

  // Loaded in when it becomes parent song
  private audioFeatures: AudioFeaturesModel | null;
  private audioAnalysis: AudioAnalysisModel | null;
  private branches: BranchModel[] | null;

  private durationMs: number;
  private explicit: boolean;
  private ID: string;
  private name: string;
  private URI: string;

  constructor({
    album,
    audioFeatures,
    audioAnalysis,
    branches,
    duration_ms,
    explicit,
    id,
    name,
    uri,
  }: Input) {
    this.album = album instanceof AlbumModel ? album : new AlbumModel(album);
    this.audioFeatures = audioFeatures || null;
    this.audioAnalysis = audioAnalysis || null;
    this.branches = branches || null;
    this.durationMs = duration_ms;
    this.explicit = explicit;
    this.ID = id;
    this.name = name;
    this.URI = uri;
  }

  public getAlbum() {
    return this.album;
  }

  public getAudioFeatures(): Promise<AudioFeaturesModel> {
    return this.audioFeatures
      ? Promise.resolve(this.audioFeatures)
      : trackFactory.addAudioFeatures(this);
  }

  public setAudioFeatures(audioFeatures: AudioFeaturesModel) {
    this.audioFeatures = audioFeatures;
  }

  public async getAudioAnalysis(): Promise<AudioAnalysisModel> {
    return this.audioAnalysis
      ? Promise.resolve(this.audioAnalysis)
      : trackFactory.addAudioAnalysis(this);
  }

  public setAudioAnalysis(audioAnalysis: AudioAnalysisModel) {
    this.audioAnalysis = audioAnalysis;
  }

  public async getBranches() {
    return this.branches
      ? Promise.resolve(this.branches)
      : trackFactory.addBranches(this);
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
