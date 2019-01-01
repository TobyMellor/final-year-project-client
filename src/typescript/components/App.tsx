import * as React from 'react';
import Nav from './Nav';
import CircleCanvas from './CircleCanvas';
import BottomBranchNav from './BottomBranchNav';

interface AppProps {}

export default function ({}: AppProps) {
  const bars = [
    {
      beats: [
        { timbreNormalized: 0.30, loudnessNormalized: 1.00 },
        { timbreNormalized: 0.11, loudnessNormalized: 0.86 },
        { timbreNormalized: 0.20, loudnessNormalized: 0.12 },
        { timbreNormalized: 0.95, loudnessNormalized: 0.40 },
      ],
    },
    {
      beats: [
        { timbreNormalized: 0.90, loudnessNormalized: 0.00 },
        { timbreNormalized: 1.00, loudnessNormalized: 0.34 },
        { timbreNormalized: 0.35, loudnessNormalized: 1.00 },
        { timbreNormalized: 0.54, loudnessNormalized: 0.65 },
      ],
    },
    {
      beats: [
        { timbreNormalized: 0.44, loudnessNormalized: 0.26 },
        { timbreNormalized: 0.96, loudnessNormalized: 0.46 },
        { timbreNormalized: 0.37, loudnessNormalized: 0.54 },
        { timbreNormalized: 0.02, loudnessNormalized: 0.77 },
      ],
    },
    {
      beats: [
        { timbreNormalized: 0.90, loudnessNormalized: 0.00 },
        { timbreNormalized: 1.00, loudnessNormalized: 0.34 },
        { timbreNormalized: 0.35, loudnessNormalized: 1.00 },
        { timbreNormalized: 0.54, loudnessNormalized: 0.65 },
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
