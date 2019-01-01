import * as React from 'react';
import classNames from 'classnames';

export interface BeatProps {
  isStartOfBar: boolean;
  isEndOfBar: boolean;
  timbreNormalized: number;
  loudnessNormalized: number;
}

class Beat extends React.Component<BeatProps> {
  constructor(props: BeatProps) {
    super(props);

    const { timbreNormalized, loudnessNormalized } = props;

    if (!this.isNumberNormalized(timbreNormalized)
        || !this.isNumberNormalized(loudnessNormalized)) {
      throw new Error('Attempted to render beats from un-normalized values!');
    }
  }

  componentDidMount() {
    //
  }

  render() {
    const { timbreNormalized, loudnessNormalized, isStartOfBar, isEndOfBar } = this.props;
    const circleColour = this.getCircleColour(timbreNormalized);
    const circleSize = this.getCircleSize(loudnessNormalized);
    const barPadding = classNames({
      'bar-start': isStartOfBar,
      'bar-end': isEndOfBar,
    });

    return (
      <div className={`beat ${barPadding}`}>
        <span className="circle circle-hollow"></span>
        <span className={`circle circle-solid ${circleColour} ${circleSize}`}></span>
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
}

export default Beat;
