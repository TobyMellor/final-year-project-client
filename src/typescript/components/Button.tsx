import * as React from 'react';
import cx from 'classnames';
import { RawBeat } from './App';
import Bar from './Bar';

interface ButtonProps {
  colourClassName?: ButtonColour;
  onClickFn: () => void;
  label: string;
  shouldFadeIn?: boolean;
  shouldHide?: boolean;
}

interface ButtonState {
  hasRendered: boolean;
}

class Button extends React.Component<ButtonProps, ButtonState> {
  constructor(props: ButtonProps) {
    super(props);

    this.state = {
      hasRendered: false,
    };
  }

  componentDidMount() {
    setTimeout(
      () => {
        this.setState({
          hasRendered: true,
        });
      },
      100);
  }

  render() {
    const { colourClassName, onClickFn, label, shouldFadeIn, shouldHide } = this.props;
    const { hasRendered } = this.state;
    const classNames = cx(
      'btn',
      colourClassName,
      {
        'start-fade': shouldFadeIn && !hasRendered,
        'end-fade': shouldFadeIn && hasRendered,
        'd-none': shouldHide,
      },
    );

    return <button type="button" className={classNames} onClick={onClickFn}>{label}</button>;
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
