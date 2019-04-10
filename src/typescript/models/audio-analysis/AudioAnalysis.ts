import { GetAnAudioAnalysisResponse } from '../../types/spotify-responses';
import BarModel from './Bar';
import BeatModel from './Beat';
import SegmentModel from './Segment';
import TrackModel from './Track';
import WebAudioService from '../../services/web-audio/WebAudioService';
import * as conversions from '../../utils/conversions';
import { TimeIdentifier } from '../../types/general';
import * as trackFactory from '../../factories/track';

interface Input extends GetAnAudioAnalysisResponse {
  trackID: string;
}

class AudioAnalysisModel {
  private _trackID: string;
  private _endOfFadeIn: TimeIdentifier;
  private _startOfFadeOut: TimeIdentifier;
  private _tempo: {
    value: number,
    confidence: number,
  };
  private _timeSignature: {
    value: number,
    confidence: number,
  };
  private _key: {
    value: number,
    confidence: number,
  };
  private _mode: {
    value: number,
    confidence: number,
  };
  private _bars: BarModel[];
  private _beats: BeatModel[];
  private _segments: SegmentModel[];

  constructor({
    track,
    bars: barsInput,
    beats: beatsInput,
    segments: segmentsInput,
    trackID,
  }: Input) {
    this._trackID = trackID;

    // Track Analysis
    this._endOfFadeIn = conversions.getTimeIdentifierFromSeconds(track.end_of_fade_in);
    this._startOfFadeOut = conversions.getTimeIdentifierFromSeconds(track.start_of_fade_out);
    this._tempo = {
      value: track.tempo,
      confidence: track.tempo_confidence,
    };
    this._timeSignature = {
      value: track.time_signature,
      confidence: track.time_signature_confidence,
    };
    this._key = {
      value: track.key,
      confidence: track.key_confidence,
    };
    this._mode = {
      value: track.mode,
      confidence: track.mode_confidence,
    };

    // Bars, Beats and Segments Analysis
    const {
      bars,
      beats,
      segments,
     } = trackFactory.createBarsBeatsAndSegments(barsInput, beatsInput, segmentsInput);

    this._bars = bars;
    this._beats = beats;
    this._segments = segments;
  }

  public get trackID(): string {
    return this._trackID;
  }

  public get beats(): BeatModel[] {
    return this._beats;
  }

  public get bars(): BarModel[] {
    return this._bars;
  }

  public get segments(): SegmentModel[] {
    return this._segments;
  }
}

export default AudioAnalysisModel;
