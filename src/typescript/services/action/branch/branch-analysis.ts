import BeatModel from '../../../models/audio-analysis/Beat';
import * as math from '../../../utils/math';
import config from '../../../config';
import SegmentModel from '../../../models/audio-analysis/Segment';
import AudioAnalysisModel from '../../../models/audio-analysis/AudioAnalysis';

// The un-normalized distance score, and the two beats
type BeatPairInfo = {
  distanceScore: number,
  normalizedDistanceScore?: number,
  firstBeat: BeatModel,
  secondBeat: BeatModel,
};

// The two beats that are similar
export type SimilarBeatPair = [BeatModel, BeatModel];

export function getSimilarBeats({ beats }: AudioAnalysisModel): SimilarBeatPair[] {
  const filteredBeats = beats.filter(isConfidenceHigh);
  const beatPairs: BeatPairInfo[] = [];

  for (let i = 0; i < filteredBeats.length; i += 1) {
    const firstBeat = filteredBeats[i];

    for (let j = i + 1; j < filteredBeats.length; j += 1) {
      const secondBeat = filteredBeats[j];

      const distanceScore = getDistanceScore(firstBeat, secondBeat);
      if (distanceScore > config.analysis.discardDistanceThreshold) {
        continue;
      }

      beatPairs.push({
        distanceScore,
        firstBeat,
        secondBeat,
      });
    }
  }

  const filteredBeatPairs = declutter(beatPairs.filter(isLong));

  const hydratedBeatPairs = hydrateBeatPairs(filteredBeatPairs);
  return hydratedBeatPairs.filter(isSimilar)
                          .map(({ firstBeat, secondBeat }) => {
                            return [firstBeat, secondBeat] as SimilarBeatPair;
                          });
}

/**
 * Hydrates BeatPairs with:
 *   - The normalized distance score
 *
 * @param beatPairs The pair of beats, with a distance score
 */
function hydrateBeatPairs(beatPairs: BeatPairInfo[]): BeatPairInfo[] {
  const scores = beatPairs.map(beatPair => beatPair.distanceScore);
  const minScore = math.getMin(scores);
  const maxScore = math.getMax(scores);

  return beatPairs.map((beatPair) => {
    const normalizedDistanceScore = math.normalizeNumber(beatPair.distanceScore,
                                                         minScore,
                                                         maxScore);

    return {
      ...beatPair,
      normalizedDistanceScore,
    };
  });
}

function isSimilar({ normalizedDistanceScore }: BeatPairInfo): boolean {
  const threshold = config.analysis.normalizedDistanceThreshold;
  return threshold !== -1 && normalizedDistanceScore <= threshold;
}

function getDistanceScore(firstBeat: BeatModel, secondBeat: BeatModel): number {
  let distance = 0;

  // Hypothesis: Branches landing on the first beat in a bar sound better
  if (!isFirstBeatInBar(firstBeat) && !isFirstBeatInBar(secondBeat)) {
    distance += config.analysis.distance_weights.notFirstBeatOrderInBar;
  }

  // Hypothesis: Any skipping of orders in a bar sounds strange
  if (!isBeatOrderSame(firstBeat, secondBeat)) {
    distance += config.analysis.distance_weights.differentBeatOrderInBar;
  }

  distance += getSegmentsDistance(firstBeat.segments, secondBeat.segments);

  return distance;
}

function isConfidenceHigh(beat: BeatModel): boolean {
  return beat.confidence >= 0;
}

function isFirstBeatInBar(beat: BeatModel): boolean {
  return beat.barOrder === 0;
}

function isBeatOrderSame(firstBeat: BeatModel, secondBeat: BeatModel): boolean {
  return firstBeat.barOrder === secondBeat.barOrder;
}

function getSegmentsDistance(
  firstSegments: SegmentModel[],
  secondSegments: SegmentModel[],
): number {
  function getSegmentDistance(firstSegment: SegmentModel, secondSegment: SegmentModel) {
    const {
      confidence,
      duration,
      endLoudnessMs,
      maxTimeLoudnessMs,
      maxLoudness,
      pitches,
      timbre,
      startLoudnessMs,
    } = config.analysis.distance_weights.beat;

    return math.distance(firstSegment.confidence, secondSegment.confidence, confidence) +
           math.distance(firstSegment.durationMs, secondSegment.durationMs, duration) +
           math.distance(firstSegment.endLoudnessMs, secondSegment.endLoudnessMs, endLoudnessMs) +
           math.distance(firstSegment.maxTimeLoudnessMs, secondSegment.maxTimeLoudnessMs, maxTimeLoudnessMs) +
           math.distance(firstSegment.maxLoudness, secondSegment.maxLoudness, maxLoudness) +
           math.euclideanDistance(firstSegment.pitches, secondSegment.pitches, pitches) +
           math.euclideanDistance(firstSegment.timbre, secondSegment.timbre, timbre) +
           math.distance(firstSegment.startLoudnessMs, secondSegment.startLoudnessMs, startLoudnessMs);
  }

  // Iterate over the beat's segments with the most segments
  const [mostSegments, fewestSegments] = firstSegments.length >= secondSegments.length
                                       ? [firstSegments, secondSegments]
                                       : [secondSegments, firstSegments];

  const totalDistance = mostSegments.reduce((distance, segment, i) => {
    const otherSegment = fewestSegments[i];

    if (!otherSegment) {
      return distance + config.analysis.distance_weights.differentSegmentLength;
    }

    return distance + getSegmentDistance(segment, otherSegment);
  }, 0);
  const meanDistance = totalDistance / mostSegments.length;

  return meanDistance;
}

export function getMockedSimilarBeats(
  { trackID, beats }: AudioAnalysisModel,
): SimilarBeatPair[] {
  const beatPairs: SimilarBeatPair[] = [];

  const hotlineBlingID = '0wwPcA6wtMf6HUMpIRdeP7';
  const endGameID = '2zMMdC4xvRClYcWNFJBZ0j';

  if (trackID === hotlineBlingID) {
    beatPairs.push([beats[11], beats[27]]);
    beatPairs.push([beats[83], beats[195]]);
    beatPairs.push([beats[90], beats[218]]);
    beatPairs.push([beats[83], beats[227]]);
    beatPairs.push([beats[83], beats[243]]);
    beatPairs.push([beats[146], beats[274]]);
    beatPairs.push([beats[163], beats[307]]);
    beatPairs.push([beats[243], beats[259]]);
    beatPairs.push([beats[320], beats[448]]);
    beatPairs.push([beats[332], beats[460]]);
    beatPairs.push([beats[335], beats[463]]);
    beatPairs.push([beats[451], beats[467]]);
    beatPairs.push([beats[483], beats[491]]);
    beatPairs.push([beats[489], beats[505]]);
  } else if (trackID === endGameID) {
    beatPairs.push([beats[11], beats[27]]);
    beatPairs.push([beats[83], beats[195]]);
    beatPairs.push([beats[90], beats[218]]);
    beatPairs.push([beats[83], beats[227]]);
    beatPairs.push([beats[83], beats[243]]);
  }

  return beatPairs;
}

/**
 * Determines if a branch is not too short
 *
 * @param beatPairs Pairs of potentially similar beats
 */
function isLong({ firstBeat, secondBeat }: BeatPairInfo): boolean {
  return math.distance(secondBeat.order, firstBeat.order) >= config.analysis.minimumBranchBeatSize;
}

/**
 * Declutters branches that start and end roughly in the same location.
 *
 * It will keep only the best branches
 *
 * @param beatPairs Pairs of potentially similar beats
 */
function declutter(beatPairs: BeatPairInfo[]): BeatPairInfo[] {
  const declutteredBeatPairs: Set<BeatPairInfo> = new Set();

  beatPairs.forEach((thisBeatPair) => {
    const clutteredBeatPairs = beatPairs.filter(otherBeatPair => isRoughlySame(thisBeatPair, otherBeatPair));
    const bestBeatPair = clutteredBeatPairs.sort((a, b) => a.distanceScore - b.distanceScore)[0];

    declutteredBeatPairs.add(bestBeatPair);
  });

  return [...declutteredBeatPairs];
}

/**
 * Determines if two branches roughly head towards the same direction
 */
function isRoughlySame(firstBeatPair: BeatPairInfo, secondBeatPair: BeatPairInfo): boolean {
  const firstBeatDistance = math.distance(firstBeatPair.firstBeat.order, secondBeatPair.firstBeat.order);
  const secondBeatDistance = math.distance(firstBeatPair.secondBeat.order, secondBeatPair.secondBeat.order);

  return firstBeatDistance <= config.analysis.minimumBranchBeatSize
      && secondBeatDistance <= config.analysis.minimumBranchBeatSize;
}
