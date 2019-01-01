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

interface BeatListState {
  highestZIndex: number;
}

class BeatList extends React.Component<BeatListProps, BeatListState> {
  constructor(props: BeatListProps) {
    super(props);

    this.state = {
      highestZIndex: 0,
    };
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
          increaseHighestZIndex: this.increaseHighestZIndex.bind(this),
          ...beat,
        });
      }
    });

    // Convert beats into beat elements
    const beatElements = beatsProps.map((beatProp, index) => {

      return <Beat key={index}
                   isStartOfBar={beatProp.isStartOfBar}
                   isEndOfBar={beatProp.isEndOfBar}
                   timbreNormalized={beatProp.timbreNormalized}
                   loudnessNormalized={beatProp.loudnessNormalized}
                   increaseHighestZIndex={beatProp.increaseHighestZIndex} />;
    });

    return (
      <div className="beats">
        {beatElements}
      </div>
    );
  }

  private increaseHighestZIndex(): number {
    this.setState(({ highestZIndex }) => {
      return {
        highestZIndex: highestZIndex + 1,
      };
    });

    return this.state.highestZIndex;
  }
}

export default BeatList;
