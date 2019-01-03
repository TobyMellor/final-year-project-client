import * as React from 'react';
import Bar from './Bar';
import cx from 'classnames';
import { BottomBranchNavStatus } from './BottomBranchNav';
import { UIBarType } from '../services/ui/entities';

export interface BeatListProps {
  bars: UIBarType[];
  shouldInvertScrollbar?: boolean;
  signalClickToParentFn: () => void;
  isHidden?: boolean;
  bottomBranchNavStatus: BottomBranchNavStatus;
}

interface BeatListState {
  selectedBarOrder: number;
  selectedBeatOrder: number;
  scrollCallbackFn: () => void;
}

class BeatList extends React.Component<BeatListProps, BeatListState> {
  constructor(props: BeatListProps) {
    super(props);

    this.state = {
      selectedBarOrder: -1,
      selectedBeatOrder: -1,
      scrollCallbackFn: () => {},
    };
  }

  render() {
    const { shouldInvertScrollbar, bars, isHidden, bottomBranchNavStatus } = this.props;
    const scrollbarClassNames = cx(
      'horizontal-scrollbar',
      {
        'invert-scrollbar': shouldInvertScrollbar,
        hidden: isHidden,
      },
    );
    const barsClassNames = cx('bars', { selected: this.isAnyBarSelected() });

    const barElements = bars.map((bar) => {
      const selectedBeatOrder = this.getSelectedBeatOrder(bar.order);

      return <Bar key={bar.order}
                  order={bar.order}
                  beats={bar.beats}
                  signalClickToParentFn={this.handleClick}
                  selectedBeatOrder={selectedBeatOrder}
                  parentComponent={this}
                  bottomBranchNavStatus={bottomBranchNavStatus} />;
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
    return this.state.selectedBarOrder !== -1;
  }

  private isBarSelected(barOrder: number) {
    return this.state.selectedBarOrder === barOrder;
  }

  private getSelectedBeatOrder(barOrder: number) {
    const isBarSelected = this.isBarSelected(barOrder);

    if (isBarSelected) {
      return this.state.selectedBeatOrder;
    }

    return -1;
  }

  // TODO: Find a better way to do this, we shouldn't be passing down
  //       the parents instance to its children
  private handleClick(
    thisComponent: BeatList,
    selectedBarOrder: number,
    selectedBeatOrder: number,
    scrollCallbackFn: () => void,
  ) {
    thisComponent.setState({
      selectedBarOrder,
      selectedBeatOrder,
      scrollCallbackFn,
    });

    thisComponent.props.signalClickToParentFn();
  }

  private handleScroll() {
    this.state.scrollCallbackFn();
  }
}

export default BeatList;
