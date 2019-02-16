import { UIBeatType, UIBarType } from '../types/general';

export function getMockUIBeat(order: number = 0, barOrder: number = 0): UIBeatType {
  return {
    order,
    barOrder,
    timbreNormalized: 0.5,
    loudnessNormalized: 0.5,
    durationMs: 10,
  };
}

export function getMockUIBar(order: number = 0): UIBarType {
  return {
    order,
    beats: [
      getMockUIBeat(0, order),
      getMockUIBeat(1, order),
    ],
  };
}
