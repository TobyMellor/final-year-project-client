import * as React from 'react';
import BeatList, { BeatListProps } from './BeatList';

interface BottomBranchNavProps extends BeatListProps {}

class BottomBranchNav extends React.Component<BottomBranchNavProps> {
  constructor(props: BottomBranchNavProps) {
    super(props);
  }

  render() {
    return (
      <div className="bottom-branch-nav">
        <BeatList bars={this.props.bars} shouldInvertScrollbar={true} />
        <BeatList bars={this.props.bars} />
      </div>
    );
  }
}

export default BottomBranchNav;
