import TrackModel from '../../models/audio-analysis/Track';
import BarModel from '../../models/audio-analysis/Bar';

export interface UIBeatType {
  order: number;
  timbreNormalized: number;
  loudnessNormalized: number;
}

export interface UIBarType {
  order: number;
  beats: UIBeatType[];
}

export async function getUIBars(track: TrackModel): Promise<UIBarType[]> {
  const audioAnalysis = await track.getAudioAnalysis();
  const maxTimbre = audioAnalysis.getMaxTimbre();
  const minTimbre = audioAnalysis.getMinTimbre();
  const maxLoudness = audioAnalysis.getMaxLoudness();
  const minLoudness = audioAnalysis.getMinLoudness();
  const bars = audioAnalysis.getBars();

  return bars.map((bar) => {
    const order = bar.getOrder();
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
  const beats = bar.getBeats();

  return beats.map((beat) => {
    const order = beat.getOrder();
    const timbreNormalized = normalizeNumber(beat.getTimbre(), maxTimbre, minTimbre);
    const loudnessNormalized = normalizeNumber(beat.getMaxLoudness(), maxLoudness, minLoudness);

    return {
      order,
      timbreNormalized,
      loudnessNormalized,
    };
  });
}

function normalizeNumber(number: number, max: number, min: number): number {
  return (number - min) / (max - min);
}
