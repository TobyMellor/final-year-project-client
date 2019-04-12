import * as React from 'react';
import cx from 'classnames';
import ui from '../../config/ui';
import { ButtonColour } from '../../types/enums';
import { ButtonProps, ButtonState } from '../../types/general';

class Button extends React.Component<ButtonProps, ButtonState> {
  constructor(props: ButtonProps) {
    super(props);

    this.state = {
      hasFadeFinished: false,
      fadeTimer: null,
    };
  }

  componentDidMount() {
    // After the fade animation has completed,
    // update the state
    const fadeTimer = setTimeout(() => {
      this.setState({
        hasFadeFinished: true,
      });
    }, ui.button.fadeAnimationDurationMs);
    this.setState({ fadeTimer });
  }

  componentWillUnmount() {
    clearTimeout(this.state.fadeTimer);
  }

  handleClick() {
    if (!this.props.disabled) {
      this.props.onClick();
    }
  }

  render() {
    const { colourClassName, label, shouldFadeIn, shouldHide, disabled } = this.props;
    const { hasFadeFinished } = this.state;
    const classNames = cx(
      'btn',
      colourClassName,
      {
        disabled,
        'start-fade': shouldFadeIn && !hasFadeFinished,
        'end-fade': shouldFadeIn && hasFadeFinished,
        'd-none': shouldHide,
      },
    );

    return (
      <button type="button"
              className={classNames}
              onClick={this.handleClick.bind(this)}
      >
        {label}
      </button>
    );
  }
}

export const PrimaryButton = (props: ButtonProps) => {
  return <Button {...props} colourClassName={ButtonColour.Primary} />;
};

export const SuccessButton = (props: ButtonProps) => {
  return <Button {...props} colourClassName={ButtonColour.Success} />;
};

export const DangerButton = (props: ButtonProps) => {
  return <Button {...props} colourClassName={ButtonColour.Danger} />;
};

export const WarningButton = (props: ButtonProps) => {
  return <Button {...props} colourClassName={ButtonColour.Warning} />;
};

export default Button;
