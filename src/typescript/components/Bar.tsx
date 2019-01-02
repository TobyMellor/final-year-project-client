import * as React from 'react';
import Beat from './Beat';
import cx from 'classnames';

export interface BarProps {
  order: number;
  beats: {
    order: number,
    timbreNormalized: number,
    loudnessNormalized: number,
  }[];
  signalClickToParentFn: (barOrder: number, beatOrder: number) => void;
  selectedBeatOrder: number;
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
    const barClassNames = cx('bar', { selected: this.isBarSelected() });

    const beatElements = beats.map((beat) => {
      const isBeatSelected = this.isBeatSelected(beat.order);

      return <Beat key={beat.order}
                   order={beat.order}
                   timbreNormalized={beat.timbreNormalized}
                   loudnessNormalized={beat.loudnessNormalized}
                   isSelected={isBeatSelected}
                   increaseHighestZIndexFn={this.increaseHighestZIndex.bind(this)}
                   signalClickToParentFn={this.signalClickToParent.bind(this, beat.order)} />;
    });

    return (
      <div className={barClassNames}>
        {beatElements}
      </div>
    );
  }

  private isBarSelected() {
    return this.props.selectedBeatOrder !== -1;
  }

  private isBeatSelected(beatOrder: number) {
    return this.isBarSelected && this.props.selectedBeatOrder === beatOrder;
  }

  private increaseHighestZIndex(): number {
    this.setState(({ highestZIndex }) => {
      return {
        highestZIndex: highestZIndex + 1,
      };
    });

    return this.state.highestZIndex;
  }

  private signalClickToParent(beatOrder: number) {
    this.props.signalClickToParentFn(this.props.order, beatOrder);
  }
}

export default Bar;
