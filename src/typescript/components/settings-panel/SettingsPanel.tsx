import * as React from 'react';
import { SuccessButton } from '../button/Button';
import { SettingsPanelProps } from '../../types/general';

class SettingsPanel extends React.Component<SettingsPanelProps> {
  constructor(props: SettingsPanelProps) {
    super(props);
  }

  render() {
    const { onToggleBranchNavClick, isBranchNavHidden, isBranchNavDisabled } = this.props;
    const toggleBranchNavLabel = isBranchNavHidden ? 'Add Branch' : 'Hide Branch Creator';

    return (
      <div className="modal show"
           tabIndex={-1}
           role="dialog"
           style={ { display: 'block' } }>
        <div className="modal-dialog settings-panel" role="document">
          <div className="modal-content">
            <div className="modal-body p-0">
              <SuccessButton label={toggleBranchNavLabel}
                             onButtonClick={() => onToggleBranchNavClick()}
                             disabled={isBranchNavDisabled} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SettingsPanel;
