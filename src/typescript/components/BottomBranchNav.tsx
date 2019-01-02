import * as React from 'react';
import BeatList, { BeatListProps } from './BeatList';
import { RawBar } from './App';

interface BottomBranchNavProps {
  bars: RawBar[];
}

interface BottomBranchNavState {
  isBeatSelected: boolean;
}

class BottomBranchNav extends React.Component<BottomBranchNavProps, BottomBranchNavState> {
  constructor(props: BottomBranchNavProps) {
    super(props);

    this.state = {
      isBeatSelected: false,
    };
  }

  render() {
    return (
      <div className="bottom-branch-nav">
        <BeatList bars={this.props.bars}
                  shouldInvertScrollbar={true}
                  signalClickToParentFn={this.handleClick.bind(this)} />
        <BeatList bars={this.props.bars}
                  isHidden={!this.state.isBeatSelected}
                  signalClickToParentFn={this.handleClick.bind(this)} />
      </div>
    );
  }

  private handleClick() {
    this.setState({
      isBeatSelected: true,
    });
  }
}

export default BottomBranchNav;
