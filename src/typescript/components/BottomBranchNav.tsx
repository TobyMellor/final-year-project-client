import * as React from 'react';
import BeatList from './BeatList';
import Translator from '../../translations/Translator';
import cx from 'classnames';
import Button, { SuccessButton } from './Button';
import { UIBarType } from '../services/ui/entities';
import { FYPEvent } from '../types/enums';
import Dispatcher from '../events/Dispatcher';
import TrackModel from '../models/audio-analysis/Track';

interface BottomBranchNavProps {
  bars: UIBarType[];
}

interface BottomBranchNavState {
  status: BottomBranchNavStatus;
  isBeatSelected: boolean;
}

class BottomBranchNav extends React.Component<BottomBranchNavProps, BottomBranchNavState> {
  constructor(props: BottomBranchNavProps) {
    super(props);

    this.state = {
      status: BottomBranchNavStatus.CHOOSE_FIRST_BEAT,
      isBeatSelected: false,
    };
  }

  render() {
    const { bars } = this.props;
    const { status } = this.state;
    const instructionForStatus = this.getInstructionForStatus();
    const modalFooterElement = this.getFooter();
    const bottomBranchNavBodyClassNames = cx(
      'bottom-branch-nav-body',
      { previewing: status === BottomBranchNavStatus.PREVIEWING },
    );

    return (
      <div className="modal fade show"
           tabIndex={-1}
           role="dialog"
           style={ { display: 'block' } }>
        <div className="modal-dialog bottom-branch-nav" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Create a Branch</h5>
              <h3 className="modal-title-feedback">{instructionForStatus}</h3>
              <button type="button" className="close" data-dismiss="modal">
                <span>&times;</span>
              </button>
            </div>
            <div className="modal-body p-0">
              <div className={bottomBranchNavBodyClassNames}>
                <BeatList bars={bars}
                          shouldInvertScrollbar={true}
                          signalClickToParentFn={
                            this.handleBeatListClick.bind(this)
                          }
                          bottomBranchNavStatus={status} />
                <BeatList bars={bars}
                          isHidden={!this.state.isBeatSelected}
                          signalClickToParentFn={
                            this.handleBeatListClick.bind(this)
                          }
                          bottomBranchNavStatus={status} />
              </div>
            </div>
            {modalFooterElement}
          </div>
        </div>
      </div>
    );
  }

  private shouldShowFooter(): boolean {
    const { status } = this.state;

    return status !== BottomBranchNavStatus.CHOOSE_FIRST_BEAT
        && status !== BottomBranchNavStatus.CHOOSE_SECOND_BEAT;
  }

  private getFooter(): JSX.Element {
    const shouldShowFooter = this.shouldShowFooter();

    if (!shouldShowFooter) {
      return <div className="modal-footer modal-footer-collapsed"></div>;
    }

    const { status } = this.state;
    const isPreviewing = status === BottomBranchNavStatus.PREVIEWING;

    return (
      <div className="modal-footer">
        <SuccessButton key="preview"
                       label="Preview"
                       onClickFn={this.handlePreviewClick.bind(this)}
                       shouldHide={isPreviewing}
                       shouldFadeIn={true} />
        <Button key="previewing_back"
                label="Back"
                onClickFn={this.handlePreviewingBackClick.bind(this)}
                shouldHide={!isPreviewing} />
        <SuccessButton key="previewing_create_branch"
                       label="Create Branch"
                       onClickFn={this.handleCreateBranchClick.bind(this)}
                       shouldHide={!isPreviewing} />
      </div>
    );
  }

  private handleBeatListClick() {
    this.setState({
      isBeatSelected: true,
    });

    const { status } = this.state;

    if (status === BottomBranchNavStatus.CHOOSE_FIRST_BEAT) {
      this.setState({
        status: BottomBranchNavStatus.CHOOSE_SECOND_BEAT,
      });
    } else if (status === BottomBranchNavStatus.CHOOSE_SECOND_BEAT) {
      this.setState({
        status: BottomBranchNavStatus.PREVIEWABLE,
      });
    }
  }

  private handlePreviewClick() {
    this.setState({
      status: BottomBranchNavStatus.PREVIEWING,
    });
  }

  private handlePreviewingBackClick() {
    this.setState({
      status: BottomBranchNavStatus.PREVIEWABLE,
    });
  }

  private handleCreateBranchClick() {
    console.log('Our work here is done!');
  }

  private getInstructionForStatus(): string {
    const status = this.state.status;
    const instruction = Translator.react.bottom_branch_nav[status];

    return instruction;
  }
}

export enum BottomBranchNavStatus {
  CHOOSE_FIRST_BEAT = 'choose_first_beat',
  CHOOSE_SECOND_BEAT = 'choose_second_beat',
  PREVIEWABLE = 'previewable',
  PREVIEWING = 'previewing',
}

export default BottomBranchNav;
