import { GetAnAudioAnalysisResponse } from '../../types/spotify-responses';
import BarModel from './Bar';
import BeatModel from './Beat';
import SegmentModel from './Segment';

class AudioAnalysisModel {
  private endOfFadeIn: number;
  private startOfFadeOut: number;
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

  constructor({ track, bars, beats, segments }: GetAnAudioAnalysisResponse) {

    // Track Analysis
    this.endOfFadeIn = track.end_of_fade_in;
    this.startOfFadeOut = track.start_of_fade_out;
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
}

export default AudioAnalysisModel;
