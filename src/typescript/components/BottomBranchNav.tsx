import * as React from 'react';
import BeatList, { BeatListProps } from './BeatList';

interface BottomBranchNavProps extends BeatListProps {}

class BottomBranchNav extends React.Component<BottomBranchNavProps> {
  constructor(props: BottomBranchNavProps) {
    super(props);
  }

  componentDidMount() {
    //
  }

  render() {
    return (
      <div className="bottom-branch-nav">
        <BeatList bars={this.props.bars} />
        <BeatList bars={this.props.bars} />
      </div>
    );
  }
}

export default BottomBranchNav;
