import { UIBeatType, UIBarType } from '../services/ui/entities';

export function getMockUIBeat(order: number = 1): UIBeatType {
  return {
    order,
    barOrder: 9,
    timbreNormalized: 0.5,
    loudnessNormalized: 0.5,
    durationMs: 10,
  };
}

export function getMockUIBar(): UIBarType {
  return null;
}
