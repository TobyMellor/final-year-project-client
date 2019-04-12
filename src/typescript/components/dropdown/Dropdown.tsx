import * as React from 'react';
import { SuccessButton } from '../button/Button';
import { DropdownProps } from '../../types/general';

class Dropdown extends React.Component<DropdownProps> {
  private selectElement: React.RefObject<HTMLSelectElement>;

  constructor(props: DropdownProps) {
    super(props);

    this.selectElement = React.createRef();
    this.state = {};
  }

  render() {
    const { options, label, disabled } = this.props;
    const optionElements = options.map(({ ID, text }) => {
      return <option key={ID} value={ID}>{text}</option>;
    });

    return (
      <div className="input-group">
        <select ref={this.selectElement} className="custom-select">
          {optionElements}
        </select>
        <div className="input-group-append">
          <SuccessButton disabled={disabled} label={label} onClick={() => this.handleButtonClick()} />
        </div>
      </div>
    );
  }

  handleButtonClick() {
    this.props.onClick(this.selectElement.current.value);
  }
}

export default Dropdown;
