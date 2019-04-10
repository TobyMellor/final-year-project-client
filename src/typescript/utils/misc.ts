import BeatModel from '../models/audio-analysis/Beat';

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
