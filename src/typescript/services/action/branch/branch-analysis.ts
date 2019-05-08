import BeatModel from '../../../models/audio-analysis/Beat';
import * as math from '../../../utils/math';
import config from '../../../config';
import SegmentModel from '../../../models/audio-analysis/Segment';
import AudioAnalysisModel from '../../../models/audio-analysis/AudioAnalysis';

const tf = require('@tensorflow/tfjs');

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

// TODO: Return a value between 0 and 1
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

  if (trackID === '4RVbK6cV0VqWdpCDcx3hiT') { // Reborn
    beatPairs.push([beats[52], beats[100]]);
    beatPairs.push([beats[53], beats[325]]);
    beatPairs.push([beats[194], beats[242]]);
    beatPairs.push([beats[86], beats[214]]);
    beatPairs.push([beats[106], beats[203]]);
    beatPairs.push([beats[205], beats[300]]);
  } else if (trackID === '3aUFrxO1B8EW63QchEl3wX') { // Feel The Love
    // Mock goes here
  } else if (trackID === '2hmHlBM0kPBm17Y7nVIW9f') { // My Propeller
    // Mock goes here
  } else if (trackID === '6wVWJl64yoTzU27EI8ep20') { // Crying Lightning
    beatPairs.push([beats[43], beats[230]]);
    beatPairs.push([beats[253], beats[354]]);
    beatPairs.push([beats[100], beats[120]]);
    beatPairs.push([beats[120], beats[164]]);
    beatPairs.push([beats[10], beats[205]]);
    beatPairs.push([beats[10], beats[205]]);
    beatPairs.push([beats[25], beats[75]]);
  } else if (trackID === '3O8NlPh2LByMU9lSRSHedm') { // Controlla
    beatPairs.push([beats[65], beats[100]]);
    beatPairs.push([beats[4], beats[200]]);
    beatPairs.push([beats[150], beats[183]]);
  } else {
    // Mock goes here
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
