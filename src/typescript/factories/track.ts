import TrackModel from '../models/audio-analysis/Track';
import AudioAnalysisModel from '../models/audio-analysis/AudioAnalysis';
import GetATrack from '../services/api/spotify/tracks';
import GetAnAudioAnalysis from '../services/api/spotify/audio-analysis';
import GetAudioFeatures from '../services/api/spotify/audio-features';
import AudioFeaturesModel from '../models/audio-features/AudioFeatures';
import BeatModel from '../models/audio-analysis/Beat';
import BarModel from '../models/audio-analysis/Bar';
import SegmentModel from '../models/audio-analysis/Segment';
import {
  GetAnAudioAnalysisResponseTimeInterval,
  GetAnAudioAnalysisResponseSegment,
} from '../types/spotify-responses';
import TimeIntervalModel from '../models/audio-analysis/TimeInterval';
import { CreateBarsBeatsAndSegments, CreateSegments } from '../types/general';

export async function createTrack(ID: string): Promise<TrackModel> {
  return GetATrack.request(ID);
}

export async function addAudioAnalysis(track: TrackModel): Promise<AudioAnalysisModel> {
  const audioAnalysis = await GetAnAudioAnalysis.request(track.ID);

  track.setAudioAnalysis(audioAnalysis);

  return audioAnalysis;
}

export async function addAudioFeatures(track: TrackModel): Promise<AudioFeaturesModel> {
  const audioFeatures = await GetAudioFeatures.request(track.ID);

  track.setAudioFeatures(audioFeatures);

  return audioFeatures;
}

export function createBarsBeatsAndSegments(
  barsInput: GetAnAudioAnalysisResponseTimeInterval[],
  beatsInput: GetAnAudioAnalysisResponseTimeInterval[],
  segmentsInput: GetAnAudioAnalysisResponseSegment[],
): CreateBarsBeatsAndSegments {
  const {
    segments,
    maxTimbre,
    minTimbre,
    maxLoudness,
    minLoudness,
  } = createSegments(segmentsInput);
  const beats = createBeats(beatsInput, segments);
  const bars = createBars(barsInput, beats);

  return {
    bars,
    beats,
    segments,
    maxTimbre,
    minTimbre,
    maxLoudness,
    minLoudness,
  };
}

function createSegments(
  segmentsInput: GetAnAudioAnalysisResponseSegment[],
): CreateSegments {
  let maxTimbre: number = null;
  let minTimbre: number = null;
  let maxLoudness: number = null;
  let minLoudness: number = null;

  const segments = segmentsInput.map((segmentInput, order) => {
    const segment = new SegmentModel({ ...segmentInput, order });
    const { timbre, maxLoudness: loudness } = segment;

    maxTimbre = Math.max(maxTimbre, timbre);
    minTimbre = Math.min(minTimbre, timbre);
    maxLoudness = Math.max(maxLoudness, loudness);
    minLoudness = Math.min(minLoudness, loudness);

    return segment;
  });

  return {
    segments,
    maxTimbre,
    minTimbre,
    maxLoudness,
    minLoudness,
  };
}

function createBeats(
  beatsInput: GetAnAudioAnalysisResponseTimeInterval[],
  segments: SegmentModel[],
): BeatModel[] {
  return beatsInput.map((beatInput, order) => {
    const segmentsWithinBeat = <SegmentModel[]> getOverlappingTimeIntervalModels(
      new TimeIntervalModel({ ...beatInput, order }),
      segments,
    );

    return new BeatModel({ ...beatInput, order, segments: segmentsWithinBeat });
  });
}

function createBars(
  barsInput: GetAnAudioAnalysisResponseTimeInterval[],
  beats: BeatModel[],
): BarModel[] {
  const availableBeats = [...beats];

  return barsInput.map((barInput, order) => {
    const beatsWithinBar = [];

    // Get all of the beats in this bar
    for (const beat of availableBeats) {

      // A beat falls outside this bar if it starts at the end
      // of this bar
      if (beat.startSecs >= barInput.start + barInput.duration) {
        break;
      }

      beatsWithinBar.push(availableBeats.shift());
    }

    return new BarModel({ ...barInput, order, beats: beatsWithinBar });
  });
}

function getOverlappingTimeIntervalModels(
  parentTimeIntervalModel: TimeIntervalModel,
  childTimeIntervalModels: TimeIntervalModel[],
): TimeIntervalModel[] {
  const [parentStartMs, parentEndMs] = parentTimeIntervalModel.startAndEndMs;

  return childTimeIntervalModels.filter((childTimeIntervalModel) => {
    const [childStartMs, childEndMs] = childTimeIntervalModel.startAndEndMs;

    // Child's straddling parentStartMs or is fully within range
    if (childEndMs >= parentStartMs && childEndMs <= parentEndMs) {
      return true;
    }

    // Child's straddling parentEndMs or is fully within range
    if (childStartMs >= parentStartMs && childStartMs <= parentEndMs) {
      return true;
    }

    // Child's straddling the entire beat
    if (childStartMs <= parentStartMs && childEndMs >= parentEndMs) {
      return true;
    }

    // Child's not overlapping anything
    return false;
  });
}
