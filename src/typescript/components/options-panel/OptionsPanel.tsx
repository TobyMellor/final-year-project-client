import * as React from 'react';
import { SuccessButton } from '../button/Button';
import { OptionsPanelProps, OptionsPanelState } from '../../types/general';
import Dropdown from '../dropdown/Dropdown';
import cx from 'classnames';
import Slider from '../slider/Slider';

class OptionsPanel extends React.Component<OptionsPanelProps, OptionsPanelState> {
  constructor(props: OptionsPanelProps) {
    super(props);

    this.state = {};
  }

  render() {
    const { toggles, isDebugPanel } = this.props;
    const dropdownElements = toggles.dropdowns.map((dropdownProps, i) => {
      return <Dropdown key={i} {...dropdownProps} />;
    });
    const buttonElements = toggles.buttons.map((buttonProps, i) => {
      return <SuccessButton key={i} {...buttonProps} />;
    });
    const sliderElements = toggles.sliders.map((sliderProps, i) => {
      return <Slider key={i} {...sliderProps} />;
    });
    const modalDialogClassNames = cx('modal-dialog', 'settings-panel', {
      'debug-panel': isDebugPanel,
    });

    return (
      <div className="modal show"
           tabIndex={-1}
           role="dialog"
           style={ { display: 'block' } }>
        <div className={modalDialogClassNames} role="document">
          <div className="modal-content">
            <div className="modal-body p-0">
              {dropdownElements}
              {buttonElements}
              {sliderElements}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default OptionsPanel;
