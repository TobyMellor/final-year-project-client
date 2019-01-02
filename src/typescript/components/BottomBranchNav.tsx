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
      <div className="modal fade show"
           tabIndex={-1}
           role="dialog"
           style={ { display: 'block' } }>
        <div className="modal-dialog bottom-branch-nav" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Create a Branch</h5>
              <h3 className="modal-title-feedback">Select a starting Beat</h3>
              <button type="button" className="close" data-dismiss="modal">
                <span>&times;</span>
              </button>
            </div>
            <div className="modal-body p-0">
              <div className="bottom-branch-nav-body">
                <BeatList bars={this.props.bars}
                          shouldInvertScrollbar={true}
                          signalClickToParentFn={this.handleClick.bind(this)} />
                <BeatList bars={this.props.bars}
                          isHidden={!this.state.isBeatSelected}
                          signalClickToParentFn={this.handleClick.bind(this)} />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-dismiss="modal">
                Close
              </button>
              <button type="button" className="btn btn-primary">
                Save changes
              </button>
            </div>
          </div>
        </div>
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
