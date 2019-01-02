import * as React from 'react';
import Bar from './Bar';
import cx from 'classnames';

export interface BeatListProps {
  bars: {
    order: number,
    beats: {
      order: number,
      timbreNormalized: number,
      loudnessNormalized: number,
    }[],
  }[];
  shouldInvertScrollbar?: boolean;
}

interface BeatListState {
  selectedBarOrder: number;
  selectedBeatOrder: number;
}

class BeatList extends React.Component<BeatListProps, BeatListState> {
  constructor(props: BeatListProps) {
    super(props);

    this.state = {
      selectedBarOrder: -1,
      selectedBeatOrder: -1,
    };
  }

  render() {
    const { shouldInvertScrollbar, bars } = this.props;
    const invertScrollbarClassName = shouldInvertScrollbar ? 'invert-scrollbar' : '';
    const barsClassNames = cx('bars', { selected: this.isAnyBarSelected() });

    const barElements = bars.map((bar) => {
      const selectedBeatOrder = this.getSelectedBeatOrder(bar.order);

      return <Bar order={bar.order}
                  beats={bar.beats}
                  signalClickToParentFn={this.select.bind(this)}
                  selectedBeatOrder={selectedBeatOrder} />;
    });

    return (
      <div className={`horizontal-scrollbar ${invertScrollbarClassName}`}>
        <div className={barsClassNames}>
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

  private select(selectedBarOrder: number, selectedBeatOrder: number) {
    this.setState({
      selectedBarOrder,
      selectedBeatOrder,
    });
  }
}

export default BeatList;
