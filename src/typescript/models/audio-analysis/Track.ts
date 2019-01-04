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
  private _album: AlbumModel;

  // Loaded in when it becomes parent song
  private _audioFeatures: AudioFeaturesModel | null;
  private _audioAnalysis: AudioAnalysisModel | null;

  private _duration: TimeIdentifier;
  private _isExplicit: boolean;
  private _ID: string;
  private _name: string;
  private _URI: string;

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
    this._album = album instanceof AlbumModel ? album : new AlbumModel(album);
    this._audioFeatures = audioFeatures || null;
    this._audioAnalysis = audioAnalysis || null;
    this._duration = conversions.getTimeIdentifierFromMilliseconds(duration_ms);
    this._isExplicit = explicit;
    this._ID = id;
    this._name = name;
    this._URI = uri;
  }

  public get album() {
    return this._album;
  }

  public get audioFeatures(): Promise<AudioFeaturesModel> {
    return this._audioFeatures
      ? Promise.resolve(this._audioFeatures)
      : trackFactory.addAudioFeatures(this);
  }

  public setAudioFeatures(audioFeatures: AudioFeaturesModel) {
    this._audioFeatures = audioFeatures;
  }

  public async getAudioAnalysis(): Promise<AudioAnalysisModel> {
    return this._audioAnalysis
      ? Promise.resolve(this._audioAnalysis)
      : trackFactory.addAudioAnalysis(this);
  }

  public setAudioAnalysis(audioAnalysis: AudioAnalysisModel) {
    this._audioAnalysis = audioAnalysis;
  }

  public get duration() {
    return this._duration;
  }

  public get isExplicit() {
    return this._isExplicit;
  }

  public get bestImageURL(): string | null {
    const { images } = this._album;

    if (images.length > 0) {
      return images[0].URL;
    }

    return null;
  }

  public get ID() {
    return this._ID;
  }

  public get name() {
    return this._name;
  }

  public get URI() {
    return this._URI;
  }

  public async getBeats(): Promise<BeatModel[]> {
    const { beats } = await this.getAudioAnalysis();

    return beats;
  }

  public async getBeatsWithOrders(beatOrders: number[]): Promise<BeatModel[]> {
    const beats = await this.getBeats();
    const beatsWithOrders: BeatModel[] = [];

    // Find the beats with the correct .order, ensure the requested order is kept
    beatOrders.forEach((beatOrder, i) => {
      beatsWithOrders[i] = beats[beatOrder];
    });

    return beatsWithOrders;
  }
}

export default TrackModel;
