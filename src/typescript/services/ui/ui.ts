import TrackModel from '../../models/audio-analysis/Track';
import BarModel from '../../models/audio-analysis/Bar';
import SegmentModel from '../../models/audio-analysis/Segment';
import { UIBarType, UIBeatType } from '../../types/general';
import CanvasService from '../canvas/CanvasService';
import WebAudioService from '../web-audio/WebAudioService';
import * as math from '../../utils/math';
import { NeedleType, BranchType } from '../../types/enums';
import WorldPoint from '../canvas/drawables/utils/WorldPoint';

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
    const timbreNormalized = math.normalizeNumber(beatTimbre, minTimbre, maxTimbre);
    const loudnessNormalized = math.normalizeNumber(beatMaxLoudness, minLoudness, maxLoudness);

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
    minTimbre: math.getMin(trimmedTimbre),
    maxTimbre: math.getMax(trimmedTimbre),
    minLoudness: math.getMin(trimmedLoudness),
    maxLoudness: math.getMax(trimmedLoudness),
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

/**
 * Rotates the rotation of the parent and child circles based on
 * how far the user has scrolled in a list
 *
 * Updates after the next requestAnimationFrame call
 *
 * @param scrollPercentage Percentage scrolled in a list, 0 to 100
 */
export function setSongCircleRotation(scrollPercentage: number) {
  CanvasService.getInstance()
               .setSongCircleRotation(NeedleType.BRANCH_NAV, scrollPercentage);
}

/**
 * Plays a series of beats to the user, and executes a callback when
 * they've finished playing.
 */
export function previewBeatsWithOrders(
  beforeOriginBeatOrders: number[],
  originBeatOrder: number,
  destinationBeatOrder: number,
  afterDestinationBeatOrders: number[],
  onEndedCallbackFn: () => void,
) {
  WebAudioService.getInstance()
                 .previewBeatsWithOrders(beforeOriginBeatOrders,
                                         originBeatOrder,
                                         destinationBeatOrder,
                                         afterDestinationBeatOrders,
                                         onEndedCallbackFn.bind(this));
}

/**
 * Forces any audio that's playing to stop. Does not execute a callback if one
 * exists
 */
export function stopPlaying() {
  WebAudioService.getInstance().stop();
}

/**
 * Displays the branch that will be created as the user
 * is choosing the beats
 *
 * If a percentage is 0, it will be anchored to the bottom of the SongCircle
 */
export function previewBezierCurve(originPercentage: number, destinationPercentage: number | null) {
  CanvasService.getInstance()
               .previewBezierCurve(originPercentage, destinationPercentage);
}

export function removePreviewBezierCurve() {
  CanvasService.getInstance()
               .removePreviewBezierCurve();
}

/**
 * Get how far the user is through the song
 *
 * This can be obtained directly from the rotationOffsetPercentage
 * set by other services
 */
export function getPlaythroughPercent() {
  return WorldPoint.rotationOffsetPercentage;
}
