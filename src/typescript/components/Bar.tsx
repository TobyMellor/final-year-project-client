import * as React from 'react';
import Beat from './Beat';
import cx from 'classnames';
import BeatList from './BeatList';
import { UIBarType, UIBeatType } from '../services/ui/entities';
import * as utils from '../utils/misc';

export interface BarProps {
  UIBar: UIBarType;
  queuedUIBeats: UIBeatType[];
  playingUIBeat: UIBeatType | null;
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
  zIndexes: number[];
}

class Bar extends React.Component<BarProps, BarState> {
  constructor(props: BarProps) {
    super(props);

    const { beats } = props.UIBar;

    this.state = {
      zIndexes: Array<number>(beats.length).fill(1),
    };
  }

  shouldComponentUpdate(nextProps: BarProps) {
    const { queuedUIBeats, playingUIBeat, selectedUIBeat, disabledUIBeats } = this.props;
    const shouldUpdate = !utils.areArraysEqual(queuedUIBeats, nextProps.queuedUIBeats) ||
                         playingUIBeat !== nextProps.playingUIBeat ||
                         selectedUIBeat !== nextProps.selectedUIBeat ||
                         !utils.areArraysEqual(disabledUIBeats, nextProps.disabledUIBeats);

    if (shouldUpdate) {
      return true;
    }

    return false;
  }

  render() {
    const { beats } = this.props.UIBar;
    const { zIndexes } = this.state;

    const beatElements = beats.map((beat, beatOffsetInBar) => {
      const beatOrder = beat.order;
      const isQueued = this.isBeatQueued(beatOrder);
      const isPlaying = this.isBeatPlaying(beatOrder);
      const isSelected = this.isBeatSelected(beatOrder);
      const isDisabled = this.isBeatDisabled(beatOrder);
      const zIndex = zIndexes[beatOffsetInBar];

      return <Beat key={beatOrder}
                   UIBeat={beat}
                   isQueued={isQueued}
                   isPlaying={isPlaying}
                   isSelected={isSelected}
                   isDisabled={isDisabled}
                   zIndex={zIndex}
                   increaseHighestZIndexFn={this.increaseHighestZIndex.bind(this, beatOffsetInBar)}
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

  private increaseHighestZIndex(beatOffsetInBar: number) {
    this.setState(({ zIndexes }) => {
      const highestZIndex = Math.max(...zIndexes) + 1;

      zIndexes[beatOffsetInBar] = highestZIndex;

      return {
        zIndexes,
      };
    });
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
