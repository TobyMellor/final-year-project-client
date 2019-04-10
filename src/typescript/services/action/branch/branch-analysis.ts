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
      beatPairs.push({
        distanceScore,
        firstBeat,
        secondBeat,
      });
    }
  }

  const hydratedBeatPairs = hydrateBeatPairs(beatPairs);
  return hydratedBeatPairs.filter(isSimilar)
                          .map(({ firstBeat, secondBeat }, i) => {
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

function isSimilar({ normalizedDistanceScore }: BeatPairInfo) {
  const distanceThreshold = config.analysis.distanceThreshold;
  return distanceThreshold !== -1 && normalizedDistanceScore <= distanceThreshold;
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
      duration,
      startLoudnessMs,
      maxTimeLoudnessMs,
      maxLoudness,
      endLoudnessMs,
    } = config.analysis.distance_weights.beat;

    return math.distance(firstSegment.durationMs, secondSegment.durationMs, duration) +
           math.distance(firstSegment.maxTimeLoudnessMs, secondSegment.maxTimeLoudnessMs, maxTimeLoudnessMs) +
           math.distance(firstSegment.maxLoudness, secondSegment.maxLoudness, maxLoudness);
  }

  // loudness
  // - start (time)
  // - maxTime (time)
  // - max
  // - end (time)
  // pitch
  // timbre
  // We can also use the duration of the beat,

  // Iterate over the beat's segments with the most segments
  const [mostSegments, fewestSegments] = firstSegments.length >= secondSegments.length
                                       ? [firstSegments, secondSegments]
                                       : [secondSegments, firstSegments];

  return mostSegments.reduce((distance, segment, i) => {
    const otherSegment = fewestSegments[i];

    if (!otherSegment) {
      return distance + config.analysis.distance_weights.differentSegmentLength;
    }

    return distance + getSegmentDistance(segment, otherSegment);
  }, 0);
}

export function getMockedSimilarBeats(
  { trackID, beats }: AudioAnalysisModel,
): SimilarBeatPair[] {
  const beatPairs: SimilarBeatPair[] = [];

  if (trackID === '4RVbK6cV0VqWdpCDcx3hiT') { // Reborn
    beatPairs.push([beats[52], beats[100]]);
    beatPairs.push([beats[53], beats[325]]);
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
