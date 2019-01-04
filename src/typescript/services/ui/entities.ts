import TrackModel from '../../models/audio-analysis/Track';
import BarModel from '../../models/audio-analysis/Bar';

export interface UIBeatType {
  order: number;
  barOrder: number;
  timbreNormalized: number;
  loudnessNormalized: number;
  durationMs: number;
}

export interface UIBarType {
  order: number;
  beats: UIBeatType[];
}

export async function getUIBars(track: TrackModel): Promise<UIBarType[]> {
  const { maxTimbre, minTimbre, maxLoudness, minLoudness, bars } = await track.getAudioAnalysis();

  return bars.map((bar) => {
    const order = bar.order;
    const UIBeats: UIBeatType[] = getUIBeats(bar, maxTimbre, minTimbre, maxLoudness, minLoudness);

    return {
      order,
      beats: UIBeats,
    };
  });
}

function getUIBeats(
  bar: BarModel,
  maxTimbre: number,
  minTimbre: number,
  maxLoudness: number,
  minLoudness: number,
): UIBeatType[] {
  const barOrder = bar.order;
  const beats = bar.beats;

  return beats.map(({ order, timbre: beatTimbre, maxLoudness: beatMaxLoudness, durationMs }) => {
    const timbreNormalized = normalizeNumber(beatTimbre, maxTimbre, minTimbre);
    const loudnessNormalized = normalizeNumber(beatMaxLoudness, maxLoudness, minLoudness);

    return {
      order,
      barOrder,
      timbreNormalized,
      loudnessNormalized,
      durationMs,
    };
  });
}

function normalizeNumber(number: number, max: number, min: number): number {
  return (number - min) / (max - min);
}
