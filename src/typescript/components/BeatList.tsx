import * as React from 'react';
import Bar from './Bar';
import cx from 'classnames';
import BottomBranchNav, { BeatListOrientation } from './BottomBranchNav';
import { UIBarType, UIBeatType } from '../services/ui/entities';

export interface BeatListProps {
  UIBars: UIBarType[];
  queuedUIBeats?: UIBeatType[];
  playingUIBeat?: UIBeatType;
  disabledUIBeats?: UIBeatType[];
  parentComponent: BottomBranchNav;
  signalClickToParentFn: (
    parentComponent: BottomBranchNav,
    beatListOrientation: BeatListOrientation,
    UIBeat: UIBeatType,
  ) => void;
  signalScrollToParentFn: (
    parentComponent: BottomBranchNav,
    beatListOrientation: BeatListOrientation,
    currentTarget: Element,
  ) => void;
  isHidden?: boolean;
  orientation: BeatListOrientation;
}

interface BeatListState {
  selectedUIBar: UIBarType;
  selectedUIBeat: UIBeatType;
  scrollCallbackFn: () => void;
}

class BeatList extends React.Component<BeatListProps, BeatListState> {
  constructor(props: BeatListProps) {
    super(props);

    this.state = {
      selectedUIBar: null,
      selectedUIBeat: null,
      scrollCallbackFn: () => {},
    };
  }

  render() {
    const {
      orientation,
      UIBars,
      isHidden,
      queuedUIBeats,
      playingUIBeat,
      disabledUIBeats,
    } = this.props;
    const scrollbarClassNames = cx(
      'horizontal-scrollbar',
      {
        'invert-scrollbar': orientation === BeatListOrientation.TOP,
        hidden: isHidden,
      },
    );
    const barsClassNames = cx('bars', { selected: this.isAnyBarSelected() });

    const barElements = UIBars.map((UIBar) => {
      const selectedUIBeat = this.getSelectedUIBeat(UIBar);

      return <Bar key={UIBar.order}
                  UIBar={UIBar}
                  queuedUIBeats={queuedUIBeats}
                  playingUIBeat={playingUIBeat}
                  selectedUIBeat={selectedUIBeat}
                  disabledUIBeats={disabledUIBeats}
                  signalClickToParentFn={this.handleClick}
                  parentComponent={this} />;
    });

    return (
      <div className={scrollbarClassNames}>
        <div className={barsClassNames}
             onScroll={this.handleScroll.bind(this)}>
          {barElements}
        </div>
      </div>
    );
  }

  private isAnyBarSelected() {
    return this.state.selectedUIBar != null;
  }

  private isBarSelected(UIBar: UIBarType) {
    return this.isAnyBarSelected() && this.state.selectedUIBar.order === UIBar.order;
  }

  private getSelectedUIBeat(UIBar: UIBarType): UIBeatType {
    const isBarSelected = this.isBarSelected(UIBar);

    if (isBarSelected) {
      return this.state.selectedUIBeat;
    }

    return null;
  }

  // TODO: Find a better way to do this, we shouldn't be passing down
  //       the parents instance to its children
  private handleClick(
    thisComponent: BeatList,
    selectedUIBar: UIBarType,
    selectedUIBeat: UIBeatType,
    scrollCallbackFn: () => void,
  ) {
    thisComponent.setState({
      selectedUIBar,
      selectedUIBeat,
      scrollCallbackFn,
    });

    thisComponent.props.signalClickToParentFn(thisComponent.props.parentComponent,
                                              thisComponent.props.orientation,
                                              selectedUIBeat);
  }

  private handleScroll({ currentTarget }: React.UIEvent) {
    const { parentComponent, orientation, signalScrollToParentFn } = this.props;
    const { scrollCallbackFn } = this.state;

    scrollCallbackFn();
    signalScrollToParentFn(parentComponent, orientation, currentTarget);
  }
}

export default BeatList;
