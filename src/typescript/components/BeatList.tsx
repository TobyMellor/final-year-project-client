import * as React from 'react';
import Bar from './Bar';
import cx from 'classnames';
import BottomBranchNav, { BeatListOrientation } from './BottomBranchNav';
import { UIBarType, UIBeatType } from '../services/ui/entities';

export interface BeatListProps {
  UIBars: UIBarType[];
  queuedUIBeats: UIBeatType[];
  playingUIBeat: UIBeatType | null;
  disabledUIBeats: UIBeatType[];
  onBeatClick: (
    beatListOrientation: BeatListOrientation,
    UIBeat: UIBeatType,
  ) => void;
  onBeatListScroll: (
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
      const [queuedUIBeats, playingUIBeat, disabledUIBeats] = this.getImportantBeats(UIBar);

      return <Bar key={UIBar.order}
                  UIBar={UIBar}
                  queuedUIBeats={queuedUIBeats}
                  playingUIBeat={playingUIBeat}
                  selectedUIBeat={selectedUIBeat}
                  disabledUIBeats={disabledUIBeats}
                  onBeatClick={
                    (UIBar, UIBeat, scrollCallbackFn) => (
                      this.handleBeatClick(UIBar, UIBeat, scrollCallbackFn)
                    )
                  } />;
    });

    return (
      <div className={scrollbarClassNames}>
        <div className={barsClassNames}
             onScroll={this.handleBeatListScroll.bind(this)}>
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

  private getImportantBeats(UIBar: UIBarType): [UIBeatType[], UIBeatType, UIBeatType[]] {
    const { queuedUIBeats, playingUIBeat, disabledUIBeats } = this.props;
    const UIBeats = [...queuedUIBeats, playingUIBeat, ...disabledUIBeats];
    const doesBarContainImportantBeats = UIBeats.some((UIBeat) => {
      return UIBeat && UIBeat.barOrder === UIBar.order;
    });

    if (doesBarContainImportantBeats) {
      return [queuedUIBeats, playingUIBeat, disabledUIBeats];
    }

    return [[], null, []];
  }

  private handleBeatClick(
    selectedUIBar: UIBarType,
    selectedUIBeat: UIBeatType,
    scrollCallbackFn: () => void,
  ) {
    this.setState({
      selectedUIBar,
      selectedUIBeat,
      scrollCallbackFn,
    });

    this.props.onBeatClick(this.props.orientation,
                           selectedUIBeat);
  }

  private handleBeatListScroll({ currentTarget }: React.UIEvent) {
    const { orientation, onBeatListScroll } = this.props;
    const { scrollCallbackFn } = this.state;

    scrollCallbackFn();
    onBeatListScroll(orientation, currentTarget);
  }
}

export default BeatList;
