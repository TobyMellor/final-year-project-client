import { GetAnAudioAnalysisResponse } from '../../types/spotify-responses';
import BarModel from './Bar';
import BeatModel from './Beat';
import SegmentModel from './Segment';
import TrackModel from './Track';
import WebAudioService from '../../services/web-audio/WebAudioService';
import * as conversions from '../../services/canvas/drawables/utils/conversions';
import { TimeIdentifier } from '../../types/general';
import * as trackFactory from '../../factories/track';

interface Input extends GetAnAudioAnalysisResponse {
  trackID: string;
}

class AudioAnalysisModel {
  private trackID: string;
  private endOfFadeIn: TimeIdentifier;
  private startOfFadeOut: TimeIdentifier;
  private tempo: {
    value: number,
    confidence: number,
  };
  private timeSignature: {
    value: number,
    confidence: number,
  };
  private key: {
    value: number,
    confidence: number,
  };
  private mode: {
    value: number,
    confidence: number,
  };
  private bars: BarModel[];
  private beats: BeatModel[];
  private segments: SegmentModel[];
  private maxTimbre: number;
  private minTimbre: number;
  private maxLoudness: number;
  private minLoudness: number;

  constructor({
    track,
    bars: barsInput,
    beats: beatsInput,
    segments: segmentsInput,
    trackID,
  }: Input) {
    this.trackID = trackID;

    // Track Analysis
    this.endOfFadeIn = conversions.getTimeIdentifierFromSeconds(track.end_of_fade_in);
    this.startOfFadeOut = conversions.getTimeIdentifierFromSeconds(track.start_of_fade_out);
    this.tempo = {
      value: track.tempo,
      confidence: track.tempo_confidence,
    };
    this.timeSignature = {
      value: track.time_signature,
      confidence: track.time_signature_confidence,
    };
    this.key = {
      value: track.key,
      confidence: track.key_confidence,
    };
    this.mode = {
      value: track.mode,
      confidence: track.mode_confidence,
    };

    // Bars, Beats and Segments Analysis
    const {
      bars,
      beats,
      segments,
      maxTimbre,
      minTimbre,
      maxLoudness,
      minLoudness,
     } = trackFactory.createBarsBeatsAndSegments(barsInput, beatsInput, segmentsInput);

    this.bars = bars;
    this.beats = beats;
    this.segments = segments;
    this.maxTimbre = maxTimbre;
    this.minTimbre = minTimbre;
    this.maxLoudness = maxLoudness;
    this.minLoudness = minLoudness;
  }

  public getTrack(): TrackModel | null {
    const webAudioService = WebAudioService.getInstance();
    const track = webAudioService.getTrack(this.trackID);

    return track;
  }

  public getTrackID(): string {
    return this.trackID;
  }

  public getBeats(): BeatModel[] {
    return this.beats;
  }

  public getBars(): BarModel[] {
    return this.bars;
  }

  public getMaxTimbre(): number {
    return this.maxTimbre;
  }

  public getMinTimbre(): number {
    return this.minTimbre;
  }

  public getMaxLoudness(): number {
    return this.maxLoudness;
  }

  public getMinLoudness(): number {
    return this.minLoudness;
  }
}

export default AudioAnalysisModel;
