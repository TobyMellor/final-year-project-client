import * as React from 'react';
import Beat, { BeatProps } from './Beat';

export interface BarProps {
  beats: {
    order: number,
    timbreNormalized: number,
    loudnessNormalized: number,
  }[];
}

interface BarState {
  highestZIndex: number;
}

class Bar extends React.Component<BarProps, BarState> {
  constructor(props: BarProps) {
    super(props);

    this.state = {
      highestZIndex: 0,
    };
  }

  render() {
    const { beats } = this.props;
    const beatElements = beats.map((beat) => {

      return <Beat key={beat.order}
                   order={beat.order}
                   timbreNormalized={beat.timbreNormalized}
                   loudnessNormalized={beat.loudnessNormalized}
                   increaseHighestZIndex={this.increaseHighestZIndex.bind(this)} />;
    });

    return (
      <div className="bar">
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

export default Bar;
