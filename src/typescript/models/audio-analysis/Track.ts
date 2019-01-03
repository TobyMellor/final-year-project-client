import AlbumModel, { Input as AlbumInput } from '../Album';
import AudioFeaturesModel from '../audio-features/AudioFeatures';
import AudioAnalysisModel from './AudioAnalysis';
import * as trackFactory from '../../factories/track';
import * as conversions from '../../services/canvas/drawables/utils/conversions';
import { TimeIdentifier } from '../../types/general';
import BeatModel from './Beat';

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

  // Loaded in when it becomes parent song
  private audioFeatures: AudioFeaturesModel | null;
  private audioAnalysis: AudioAnalysisModel | null;

  private duration: TimeIdentifier;
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
    this.duration = conversions.getTimeIdentifierFromMilliseconds(duration_ms);
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

  public getDuration() {
    return this.duration;
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

  public async getBeats(): Promise<BeatModel[]> {
    const audioAnalysis = await this.getAudioAnalysis();
    const beats = audioAnalysis.getBeats();

    return beats;
  }

  public async getBeatsWithOrders(beatOrders: number[]): Promise<BeatModel[]> {
    const allBeats = await this.getBeats();
    const beatsWithOrders = allBeats.filter((_, i) => beatOrders.includes(i));

    return beatsWithOrders;
  }
}

export default TrackModel;
