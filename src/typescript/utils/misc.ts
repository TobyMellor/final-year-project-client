import BeatModel from '../models/audio-analysis/Beat';
import { MeshAnimationOptions } from '../services/canvas/drawables/Updatable';
import * as conversions from './conversions';
import { RGB, TimeIdentifier } from '../types/general';
import TimeIntervalModel from '../models/audio-analysis/TimeInterval';
import Translator from '../../translations/Translator';

export function areArraysEqual<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i += 1) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
}

export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function isNumberNormalized(number: number): boolean {
  return 0 <= number && number <= 1;
}

export function hasUpdated(current: any, next: any, keys: string[]) {
  return keys.some((key) => {
    if (Array.isArray(current[key])) {
      return !areArraysEqual(current[key], next[key]);
    }

    return current[key] !== next[key];
  });
}

export function shouldUpdate(
  currentProps: any,
  nextProps: any,
  importantProps: string[],
  currentState: any = null,
  nextState: any = null,
  importantStates: string[] = [],
) {
  if (hasUpdated(currentProps, nextProps, importantProps)) {
    return true;
  }

  // Only check the props
  if (currentState === null) {
    return false;
  }

  return hasUpdated(currentState, nextState, importantStates);
}

export function getEarliestAndLatestBeat(firstBeat: BeatModel, secondBeat: BeatModel): [BeatModel, BeatModel] {
  return firstBeat.order < secondBeat.order ? [firstBeat, secondBeat] : [secondBeat, firstBeat];
}

export function getDurationOfBeats(beats: BeatModel[]): TimeIdentifier {
  const durationMs = beats.reduce((acc, cur) => acc + cur.durationMs, 0);
  const duration = conversions.getTimeIdentifierFromMs(durationMs);

  return duration;
}

export function getBeatsBetween(
  beats: BeatModel[],
  { order: fromBeatOrder }: BeatModel,
  { order: toBeatOrder }: BeatModel,
  shouldIncludeFromTo: boolean = false,
): BeatModel[] {
  const fromIndex = shouldIncludeFromTo ? fromBeatOrder : fromBeatOrder + 1;
  const toIndex = shouldIncludeFromTo ? toBeatOrder + 1 : toBeatOrder;

  return beats.slice(fromIndex, toIndex);
}

// Gets all beats from one to another, including the from and to beats
export function getBeatsThrough(beats: BeatModel[], fromBeat: BeatModel, toBeat: BeatModel): BeatModel[] {
  return getBeatsBetween(beats, fromBeat, toBeat, true);
}

export function getBeatsFromMs(beats: BeatModel[], fromMs: number): BeatModel[] {
  return beats.filter(({ startMs }) => {
    return startMs >= fromMs;
  });
}

export function getBeatFromMs(beats: BeatModel[], fromMs: number): BeatModel {
  for (let i = 0; i < beats.length; i += 1) {
    const beat = beats[i];

    if (beat.startMs >= fromMs) {
      return beat;
    }
  }

  throw new Error(Translator.errors.not_found);
}

export function msToMinutes(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${`0${seconds}`.slice(-2)}`;
}
