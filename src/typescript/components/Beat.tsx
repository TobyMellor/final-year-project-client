import * as React from 'react';
import cx from 'classnames';

export interface BeatProps {
  order: number;
  timbreNormalized: number;
  loudnessNormalized: number;
  increaseHighestZIndexFn: () => number;
  isSelected: boolean;
  signalClickToParentFn: (beatOrder: number) => void;
}

interface BeatState {
  hoverCount: number;
}

class Beat extends React.Component<BeatProps, BeatState> {
  constructor(props: BeatProps) {
    super(props);

    const { timbreNormalized, loudnessNormalized } = props;

    if (!this.isNumberNormalized(timbreNormalized)
        || !this.isNumberNormalized(loudnessNormalized)) {
      throw new Error('Attempted to render beats from un-normalized values!');
    }

    this.state = {
      hoverCount: 0,
    };
  }

  render() {
    const { order, timbreNormalized, loudnessNormalized } = this.props;

    const circleColour = this.getCircleColour(timbreNormalized);
    const circleSize = this.getCircleSize(loudnessNormalized);
    const circleSolidClassNames = cx('circle', 'circle-solid', circleColour, circleSize);
    const beatClassName = cx('beat', { selected: this.props.isSelected });

    return (
      <div className={beatClassName}
           style={{ zIndex: this.state.hoverCount }}
           onMouseEnter={this.increaseHoverCount.bind(this)}
           onClick={this.select.bind(this)}>
        <span className="circle circle-hollow"></span>
        <span className={circleSolidClassNames}></span>
        <div className="beat-order-container">
          <span>{order}</span>
        </div>
      </div>
    );
  }

  private getCircleColour(timbreNormalized: number): string {
    const availableColours = [
      'light-purple',
      'dark-purple',
      'light-blue',
      'dark-blue',
      'light-green',
      'dark-green',
      'light-yellow',
      'dark-yellow',
      'light-orange',
      'dark-orange',
      'light-red',
      'dark-red',
    ];

    return this.getCorrespondingClassName(availableColours, timbreNormalized);
  }

  private getCircleSize(loudnessNormalized: number): string {
    const availableSizes = [
      'xs',
      'sm',
      'md',
      'lg',
      'xl',
    ];

    return this.getCorrespondingClassName(availableSizes, loudnessNormalized);
  }

  private getCorrespondingClassName(array: string[], numberNormalized: number): string {
    const index = Math.round((array.length - 1) * numberNormalized);
    const element = array[index];
    const className = `circle-${element}`;

    return className;
  }

  private isNumberNormalized(number: number): boolean {
    return 0 <= number && number <= 1;
  }

  private increaseHoverCount() {
    const highestZIndex = this.props.increaseHighestZIndexFn();

    this.setState({
      hoverCount: highestZIndex,
    });
  }

  private select(e: React.MouseEvent<HTMLDivElement>) {
    const beatElement: any = e.target;

    beatElement.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
    });

    this.props.signalClickToParentFn(this.props.order);
  }
}

export default Beat;
