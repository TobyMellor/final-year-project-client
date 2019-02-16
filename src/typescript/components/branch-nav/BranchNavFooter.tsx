import * as React from 'react';
import { BranchNavStatus } from '../../types/enums';
import Button, { SuccessButton } from '../button/Button';
import { BranchNavFooterProps } from '../../types/general';

class BranchNavFooter extends React.Component<BranchNavFooterProps> {
  constructor(props: BranchNavFooterProps) {
    super(props);
  }

  render() {
    const shouldShowFooter = this.shouldShowFooter();

    if (!shouldShowFooter) {
      return <div className="modal-footer modal-footer-collapsed"></div>;
    }

    const {
      status,
      onPreviewClick,
      onPreviewingBackClick,
      onPreviewingCreateBranchClick,
    } = this.props;
    const isPreviewing = status === BranchNavStatus.PREVIEWING;

    return (
      <div className="modal-footer">
        <SuccessButton key="preview"
                       label="Preview"
                       onButtonClick={() => onPreviewClick()}
                       shouldHide={isPreviewing}
                       shouldFadeIn={true} />
        <Button key="previewing_back"
                label="Back"
                onButtonClick={() => onPreviewingBackClick()}
                shouldHide={!isPreviewing} />
        <SuccessButton key="previewing_create_branch"
                       label="Create Branch"
                       onButtonClick={() => onPreviewingCreateBranchClick()}
                       shouldHide={!isPreviewing} />
      </div>
    );
  }

  private shouldShowFooter(): boolean {
    const status = this.props.status;

    return status !== BranchNavStatus.CHOOSE_FIRST_BEAT
        && status !== BranchNavStatus.CHOOSE_SECOND_BEAT;
  }
}

export default BranchNavFooter;
