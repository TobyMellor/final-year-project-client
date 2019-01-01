import * as React from 'react';
import Beat, { BeatProps } from './Beat';

export interface BeatListProps {
  bars: {
    beats: {
      timbreNormalized: number,
      loudnessNormalized: number,
    }[],
  }[];
}

class BeatList extends React.Component<BeatListProps> {
  constructor(props: BeatListProps) {
    super(props);
  }

  componentDidMount() {
    //
  }

  render() {
    const { bars } = this.props;
    const beatsProps: BeatProps[] = [];

    // Add "isStartOfBar" and "isEndOfBar" to each beat
    bars.forEach(({ beats }) => {
      for (let i = 0; i < beats.length; i += 1) {
        const beat = beats[i];

        beatsProps.push({
          isStartOfBar: i === 0,
          isEndOfBar: i === beats.length - 1,
          ...beat,
        });
      }
    });

    // Convert beats into beat elements
    const beatElements = beatsProps.map((beatProp, index) => {
      const { isStartOfBar, isEndOfBar, timbreNormalized, loudnessNormalized } = beatProp;

      return <Beat key={index}
                   isStartOfBar={isStartOfBar}
                   isEndOfBar={isEndOfBar}
                   timbreNormalized={timbreNormalized}
                   loudnessNormalized={loudnessNormalized} />;
    });

    return (
      <div className="beats">
        {beatElements}
      </div>
    );
  }
}

export default BeatList;
