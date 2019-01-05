import * as React from 'react';
import Beat from './Beat';
import cx from 'classnames';
import BeatList from './BeatList';
import { UIBarType, UIBeatType } from '../services/ui/entities';

export interface BarProps {
  UIBar: UIBarType;
  queuedUIBeats?: UIBeatType[];
  playingUIBeat?: UIBeatType;
  selectedUIBeat: UIBeatType | null;
  disabledUIBeats: UIBeatType[];
  parentComponent: BeatList;
  signalClickToParentFn: (
    parentComponent: BeatList,
    UIBar: UIBarType,
    UIBeat: UIBeatType,
    scrollCallbackFn: () => void,
  ) => void;
}

interface BarState {
  highestZIndex: number;
}

class Bar extends React.Component<BarProps, BarState> {
  constructor(props: BarProps) {
    super(props);

    this.state = {
      highestZIndex: 1,
    };
  }

  render() {
    const { beats } = this.props.UIBar;

    const beatElements = beats.map((beat) => {
      const isQueued = this.isBeatQueued(beat.order);
      const isPlaying = this.isBeatPlaying(beat.order);
      const isSelected = this.isBeatSelected(beat.order);
      const isDisabled = this.isBeatDisabled(beat.order);

      return <Beat key={beat.order}
                   UIBeat={beat}
                   isQueued={isQueued}
                   isPlaying={isPlaying}
                   isSelected={isSelected}
                   isDisabled={isDisabled}
                   increaseHighestZIndexFn={this.increaseHighestZIndex.bind(this)}
                   signalClickToParentFn={this.signalClickToParent}
                   parentComponent={this} />;
    });
    const barClassNames = cx(
      'bar',
      {
        selected: this.isBarSelected(),
        queued: beats.some(beat => this.isBeatQueued(beat.order)), // Queued when any beat is
      },
    );

    return (
      <div className={barClassNames}>
        {beatElements}
      </div>
    );
  }

  private isBarSelected() {
    return this.props.selectedUIBeat !== null;
  }

  private isBeatQueued(beatOrder: number) {
    const { queuedUIBeats } = this.props;

    return queuedUIBeats && queuedUIBeats.some(beat => beat.order === beatOrder);
  }

  private isBeatPlaying(beatOrder: number) {
    const { playingUIBeat } = this.props;

    return playingUIBeat && playingUIBeat.order === beatOrder;
  }

  private isBeatSelected(beatOrder: number) {
    const { selectedUIBeat } = this.props;

    return this.isBarSelected() && selectedUIBeat.order === beatOrder;
  }

  private isBeatDisabled(beatOrder: number) {
    const { disabledUIBeats } = this.props;

    return disabledUIBeats && disabledUIBeats.some(beat => beat.order === beatOrder);
  }

  private increaseHighestZIndex(): number {
    this.setState(({ highestZIndex }) => {
      return {
        highestZIndex: highestZIndex + 1,
      };
    });

    return this.state.highestZIndex;
  }

  private signalClickToParent(
    thisComponent: Bar,
    UIBeat: UIBeatType,
    scrollCallbackFn: () => void,
  ) {
    const props = thisComponent.props;

    props.signalClickToParentFn(props.parentComponent,
                                props.UIBar,
                                UIBeat,
                                scrollCallbackFn);
  }
}

export default Bar;
