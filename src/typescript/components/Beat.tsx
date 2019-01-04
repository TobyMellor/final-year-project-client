import * as React from 'react';
import cx from 'classnames';
import Bar from './Bar';
import { UIBeatType } from '../services/ui/entities';

export interface BeatProps {
  UIBeat: UIBeatType;
  isQueued: boolean;
  isPlaying: boolean;
  isSelected: boolean;
  parentComponent: Bar;
  signalClickToParentFn: (
    parentComponent: Bar,
    UIBeat: UIBeatType,
    scrollCallbackFn: () => void,
  ) => void;
  increaseHighestZIndexFn: () => number;
}

interface BeatState {
  hoverCount: number;
  scrollReturnTimer: NodeJS.Timeout | null;
}

class Beat extends React.Component<BeatProps, BeatState> {
  private beatElement: React.RefObject<HTMLDivElement>;

  constructor(props: BeatProps) {
    super(props);

    const { timbreNormalized, loudnessNormalized } = props.UIBeat;

    if (!this.isNumberNormalized(timbreNormalized)
        || !this.isNumberNormalized(loudnessNormalized)) {
      throw new Error('Attempted to render beats from un-normalized values!');
    }

    this.beatElement = React.createRef();
    this.state = {
      hoverCount: 0,
      scrollReturnTimer: null,
    };
  }

  render() {
    const { isQueued, isPlaying, isSelected, UIBeat } = this.props;
    const { order, timbreNormalized, loudnessNormalized } = UIBeat;
    const circleColour = this.getCircleColour(timbreNormalized);
    const circleSize = this.getCircleSize(loudnessNormalized);
    const circleSolidClassNames = cx('circle', 'circle-solid', circleColour, circleSize);
    const beatClassName = cx(
      'beat',
      {
        queued: isQueued,
        playing: isPlaying,
        selected: isSelected,
      },
    );

    return (
      <div ref={this.beatElement}
           className={beatClassName}
           style={{ zIndex: this.state.hoverCount }}
           onMouseEnter={this.increaseHoverCount.bind(this)}
           onClick={this.handleClick.bind(this)}>
        <span className="circle circle-hollow"></span>
        <span className={circleSolidClassNames}></span>
        <div className="beat-order-container">
          <span>{order + 1}</span>
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

  private handleClick() {
    this.props.signalClickToParentFn(this.props.parentComponent,
                                     this.props.UIBeat,
                                     this.handleParentScroll.bind(this));

    // Scroll to the circle, after all animations have finished
    const EXPAND_ANIMATION_TIME_MS = 450;
    setTimeout(() => this.scrollBeatIntoView(), EXPAND_ANIMATION_TIME_MS);
  }

  private handleParentScroll() {
    const SCROLL_BACK_AFTER_MS = 2500;

    const timer = setTimeout(
      () => {
        if (!this.props.isSelected) {
          return;
        }

        this.scrollBeatIntoView();
      },
      SCROLL_BACK_AFTER_MS);

    this.setState(({ scrollReturnTimer }) => {
      clearTimeout(scrollReturnTimer);

      return { scrollReturnTimer: timer };
    });
  }

  private scrollBeatIntoView() {
    const beatElement = this.beatElement.current;

    beatElement.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
    });
  }
}

export default Beat;
