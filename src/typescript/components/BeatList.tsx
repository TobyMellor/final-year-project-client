import * as React from 'react';
import Bar, { BarProps } from './Bar';

export interface BeatListProps {
  bars: BarProps[];
  shouldInvertScrollbar?: boolean;
}

class BeatList extends React.Component<BeatListProps> {
  constructor(props: BeatListProps) {
    super(props);
  }

  render() {
    const { shouldInvertScrollbar, bars } = this.props;
    const invertScrollbarClassName = shouldInvertScrollbar ? 'invert-scrollbar' : '';

    const barElements = bars.map((bar) => {
      return <Bar beats={bar.beats} />;
    });

    return (
      <div className={`horizontal-scrollbar ${invertScrollbarClassName}`}>
        <div className="bars">
          {barElements}
        </div>
      </div>
    );
  }
}

export default BeatList;
