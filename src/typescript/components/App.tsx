import * as React from 'react';
import Nav from './Nav';
import CircleCanvas from './CircleCanvas';
import BottomBranchNav from './BottomBranchNav';

interface AppProps {}

export default function ({}: AppProps) {
  const bars = [
    {
      order: 1,
      beats: [
        { order: 1, timbreNormalized: 0.30, loudnessNormalized: 1.00 },
        { order: 2, timbreNormalized: 0.11, loudnessNormalized: 0.86 },
        { order: 3, timbreNormalized: 0.20, loudnessNormalized: 0.12 },
        { order: 4, timbreNormalized: 0.95, loudnessNormalized: 0.40 },
      ],
    },
    {
      order: 2,
      beats: [
        { order: 5, timbreNormalized: 0.90, loudnessNormalized: 0.00 },
        { order: 6, timbreNormalized: 1.00, loudnessNormalized: 0.34 },
        { order: 7, timbreNormalized: 0.35, loudnessNormalized: 1.00 },
        { order: 8, timbreNormalized: 0.54, loudnessNormalized: 0.65 },
      ],
    },
    {
      order: 3,
      beats: [
        { order: 9, timbreNormalized: 0.44, loudnessNormalized: 0.26 },
        { order: 10, timbreNormalized: 0.96, loudnessNormalized: 0.46 },
        { order: 11, timbreNormalized: 0.37, loudnessNormalized: 0.54 },
        { order: 12, timbreNormalized: 0.02, loudnessNormalized: 0.77 },
      ],
    },
    {
      order: 4,
      beats: [
        { order: 13, timbreNormalized: 0.90, loudnessNormalized: 0.00 },
        { order: 14, timbreNormalized: 1.00, loudnessNormalized: 0.34 },
        { order: 15, timbreNormalized: 0.35, loudnessNormalized: 1.00 },
        { order: 16, timbreNormalized: 0.54, loudnessNormalized: 0.65 },
      ],
    },
    {
      order: 5,
      beats: [
        { order: 17, timbreNormalized: 0.35, loudnessNormalized: 1.00 },
        { order: 18, timbreNormalized: 0.55, loudnessNormalized: 1.00 },
        { order: 19, timbreNormalized: 0.23, loudnessNormalized: 0.85 },
        { order: 20, timbreNormalized: 0.75, loudnessNormalized: 0.12 },
      ],
    },
  ];

  return (
    <React.Fragment>
      <Nav />
      <CircleCanvas />
      <BottomBranchNav bars={bars} />
    </React.Fragment>
  );
}

export interface RawBeat {
  order: number;
  timbreNormalized: number;
  loudnessNormalized: number;
}

export interface RawBar {
  order: number;
  beats: RawBeat[];
}
