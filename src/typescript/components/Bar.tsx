import * as React from 'react';
import Beat from './Beat';
import cx from 'classnames';
import { RawBar } from './App';
import BeatList from './BeatList';

export interface BarProps extends RawBar {
  signalClickToParentFn: (
    parentComponent: BeatList,
    barOrder: number,
    beatOrder: number,
    scrollCallbackFn: () => void,
  ) => void;
  selectedBeatOrder: number;
  parentComponent: BeatList;
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
                   signalClickToParentFn={this.signalClickToParent}
                   parentComponent={this} />;
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

  private signalClickToParent(thisComponent: Bar, beatOrder: number, scrollCallbackFn: () => void) {
    const props = thisComponent.props;

    props.signalClickToParentFn(props.parentComponent,
                                props.order,
                                beatOrder,
                                scrollCallbackFn);
  }
}

export default Bar;
