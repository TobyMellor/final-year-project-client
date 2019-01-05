import TrackModel from '../../models/audio-analysis/Track';
import BarModel from '../../models/audio-analysis/Bar';
import SegmentModel from '../../models/audio-analysis/Segment';

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
  const { bars, segments } = await track.getAudioAnalysis();

  const PERCENT_TO_TRIM_TIMBRE = 0.01;
  const PERCENT_TO_TRIM_LOUDNESS = 0.1;
  const {
    minTimbre,
    maxTimbre,
    minLoudness,
    maxLoudness,
  } = getTimbreAndLoudness(segments, PERCENT_TO_TRIM_TIMBRE, PERCENT_TO_TRIM_LOUDNESS);

  return bars.map((bar) => {
    const order = bar.order;
    const UIBeats: UIBeatType[] = getUIBeats(bar, minTimbre, maxTimbre, minLoudness, maxLoudness);

    return {
      order,
      beats: UIBeats,
    };
  });
}

function getUIBeats(
  bar: BarModel,
  minTimbre: number,
  maxTimbre: number,
  minLoudness: number,
  maxLoudness: number,
): UIBeatType[] {
  const barOrder = bar.order;
  const beats = bar.beats;

  return beats.map(({ order, timbre: beatTimbre, maxLoudness: beatMaxLoudness, durationMs }) => {
    const timbreNormalized = normalizeNumber(beatTimbre, minTimbre, maxTimbre);
    const loudnessNormalized = normalizeNumber(beatMaxLoudness, minLoudness, maxLoudness);

    return {
      order,
      barOrder,
      timbreNormalized,
      loudnessNormalized,
      durationMs,
    };
  });
}

function getTimbreAndLoudness(
  segments: SegmentModel[],
  trimTimbreDecimal: number,
  trimLoudnessDecimal: number,
) {
  const { timbreDataset, loudnessDataset } = segments.reduce(
    (acc, segment) => {
      acc.timbreDataset.push(segment.timbre);
      acc.loudnessDataset.push(segment.maxLoudness);

      return acc;
    },
    { timbreDataset: [], loudnessDataset: [] });

  const trimmedTimbre = getTrimmedDataset(timbreDataset,
                                          trimTimbreDecimal);
  const trimmedLoudness = getTrimmedDataset(loudnessDataset,
                                            trimLoudnessDecimal);

  return {
    minTimbre: Math.min(...trimmedTimbre),
    maxTimbre: Math.max(...trimmedTimbre),
    minLoudness: Math.min(...trimmedLoudness),
    maxLoudness: Math.max(...trimmedLoudness),
  };
}

function getTrimmedDataset(numbers: number[], trimDecimal: number) {
  const sortedNumbers = numbers.sort((a, b) => a - b);
  const numberCount = numbers.length;
  const elementstoTrim = numberCount * trimDecimal;

  // Trim the bottom and top percentage of the dataset
  sortedNumbers.splice(0, trimDecimal);
  sortedNumbers.splice(numberCount - elementstoTrim, elementstoTrim);

  return sortedNumbers;
}

function normalizeNumber(number: number, min: number, max: number): number {
  const cappedNumber = capNumberBetween(number, min, max);
  const normalizedNumber = (cappedNumber - min) / (max - min);

  return normalizedNumber;
}

/**
 * Cap a number at a min and max value.
 *
 * e.g. If the max cap is 100, but the number is 1000,
 * the number will be capped at 100.
 *
 * @param number The number to cap
 * @param min The minimum number before capping
 * @param max The maximum number before capping
 */
function capNumberBetween(number: number, min: number, max: number): number {
  const lowerCapped = Math.max(number, min);
  const numberCapped = Math.min(lowerCapped, max);

  return numberCapped;
}
