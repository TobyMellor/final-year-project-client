import AlbumModel, { Input as AlbumInput } from '../Album';
import AudioFeaturesModel from '../audio-features/AudioFeatures';
import AudioAnalysisModel from './AudioAnalysis';
import * as trackFactory from '../../factories/track';
import * as conversions from '../../utils/conversions';
import { TimeIdentifier } from '../../types/general';
import BeatModel from './Beat';

export type Input = {
  album: AlbumModel | AlbumInput;
  audioFeatures: AudioFeaturesModel;
  audioAnalysis: AudioAnalysisModel;
  duration_ms: number;
  explicit: boolean;
  id: string;
  name: string;
  uri: string;
};

class TrackModel {
  private _album: AlbumModel;

  // Loaded in when it becomes parent song
  public audioFeatures: AudioFeaturesModel;
  public audioAnalysis: AudioAnalysisModel;

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
    this.audioFeatures = audioFeatures;
    this.audioAnalysis = audioAnalysis;
    this._duration = conversions.getTimeIdentifierFromMs(duration_ms);
    this._isExplicit = explicit;
    this._ID = id;
    this._name = name;
    this._URI = uri;
  }

  public get album() {
    return this._album;
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

  public get beats(): BeatModel[] {
    return this.audioAnalysis.beats;
  }
}

export default TrackModel;
