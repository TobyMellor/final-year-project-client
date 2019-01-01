import * as React from 'react';
import Beat, { BeatProps } from './Beat';

export interface BeatListProps {
  bars: {
    beats: {
      order: number,
      timbreNormalized: number,
      loudnessNormalized: number,
    }[],
  }[];
  shouldInvertScrollbar?: boolean;
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

  render() {
    const { shouldInvertScrollbar, bars } = this.props;
    const invertScrollbarClassName = shouldInvertScrollbar ? 'invert-scrollbar' : '';
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
    const beatElements = beatsProps.map((beatProp) => {

      return <Beat key={beatProp.order}
                   isStartOfBar={beatProp.isStartOfBar}
                   isEndOfBar={beatProp.isEndOfBar}
                   order={beatProp.order}
                   timbreNormalized={beatProp.timbreNormalized}
                   loudnessNormalized={beatProp.loudnessNormalized}
                   increaseHighestZIndex={beatProp.increaseHighestZIndex} />;
    });

    return (
      <div className={`horizontal-scrollbar ${invertScrollbarClassName}`}>
        <div className="beats">
          {beatElements}
        </div>
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
