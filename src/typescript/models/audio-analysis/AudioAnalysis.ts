import { GetAnAudioAnalysisResponse } from '../../types/spotify-responses';
import BarModel from './Bar';
import BeatModel from './Beat';
import SegmentModel from './Segment';
import TrackModel from './Track';
import WebAudioService from '../../services/web-audio/WebAudioService';
import * as conversions from '../../services/canvas/drawables/utils/conversions';
import { TimeIdentifier } from '../../types/general';

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

  constructor({ track, bars, beats, segments, trackID }: Input) {
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

    // Bars Analysis
    this.bars = bars.map(bar => new BarModel(bar));

    // Beats Analysis
    this.beats = beats.map(beat => new BeatModel(beat));

    // Segment Analysis
    this.segments = segments.map(segment => new SegmentModel(segment));
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
}

export default AudioAnalysisModel;
