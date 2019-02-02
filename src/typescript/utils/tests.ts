import { UIBeatType, UIBarType } from '../services/ui/entities';

export function getMockUIBeat(order: number = 1, barOrder: number = 1): UIBeatType {
  return {
    order,
    barOrder,
    timbreNormalized: 0.5,
    loudnessNormalized: 0.5,
    durationMs: 10,
  };
}

export function getMockUIBar(order: number = 1): UIBarType {
  return {
    order,
    beats: [
      getMockUIBeat(1, order),
      getMockUIBeat(2, order),
    ],
  };
}
