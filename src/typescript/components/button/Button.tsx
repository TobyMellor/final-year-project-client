import * as React from 'react';
import cx from 'classnames';
import ui from '../../config/ui';

interface ButtonProps {
  colourClassName?: ButtonColour;
  onButtonClick: () => void;
  label: string;
  shouldFadeIn?: boolean;
  shouldHide?: boolean;
}

interface ButtonState {
  hasFadeFinished: boolean;
}

class Button extends React.Component<ButtonProps, ButtonState> {
  constructor(props: ButtonProps) {
    super(props);

    this.state = {
      hasFadeFinished: false,
    };
  }

  componentDidMount() {
    // After the fade animation has completed,
    // update the state
    setTimeout(() => {
      this.setState({
        hasFadeFinished: true,
      });
    }, ui.button.fadeAnimationDurationMs);
  }

  handleClick() {
    this.props.onButtonClick();
  }

  render() {
    const { colourClassName, label, shouldFadeIn, shouldHide } = this.props;
    const { hasFadeFinished } = this.state;
    const classNames = cx(
      'btn',
      colourClassName,
      {
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

enum ButtonColour {
  Primary = 'btn-primary',
  Success = 'btn-success',
  Danger = 'btn-danger',
  Warning = 'btn-warning',
}

export default Button;
