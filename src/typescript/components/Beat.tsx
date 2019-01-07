import * as React from 'react';
import cx from 'classnames';
import Bar from './Bar';
import { UIBeatType } from '../services/ui/entities';

export interface BeatProps {
  UIBeat: UIBeatType;
  isQueued: boolean;
  isPlaying: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  parentComponent: Bar;
  signalClickToParentFn: (
    parentComponent: Bar,
    UIBeat: UIBeatType,
    scrollCallbackFn: () => void,
  ) => void;
  zIndex: number;
  increaseHighestZIndexFn: () => void;
}

interface BeatState {
  hoverCount?: number;
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
      scrollReturnTimer: null,
    };
  }

  componentDidMount() {
    const { order } = this.props.UIBeat;

    if (order === 0) {
      this.scrollBeatToLeft();
    }
  }

  shouldComponentUpdate(nextProps: BeatProps) {
    const { isQueued, isPlaying, isSelected, isDisabled, zIndex } = this.props;
    const shouldUpdate = isQueued !== nextProps.isQueued ||
                         isPlaying !== nextProps.isPlaying ||
                         isSelected !== nextProps.isSelected ||
                         isDisabled !== nextProps.isDisabled ||
                         zIndex !== nextProps.zIndex;

    if (shouldUpdate) {
      return true;
    }

    return false;
  }

  render() {
    const { isQueued, isPlaying, isSelected, isDisabled, UIBeat, zIndex } = this.props;
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
        disabled: isDisabled,
      },
    );

    return (
      <div ref={this.beatElement}
           className={beatClassName}
           style={{ zIndex }}
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
      'light-black',
      'dark-black',
      'light-purple',
      'dark-purple',
      'light-blue',
      'dark-blue',
      'light-turquoise',
      'dark-turquoise',
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
      'xxs',
      'xs',
      'sm',
      'md',
      'lg',
      'xl',
      'xxl',
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
    this.props.increaseHighestZIndexFn();
  }

  private handleClick() {
    const { isDisabled } = this.props;

    if (isDisabled) {
      return;
    }

    // Fake a scroll event immediately so we can start rotating
    // before the expansion animation
    this.triggerScrollEvent();

    this.props.signalClickToParentFn(this.props.parentComponent,
                                     this.props.UIBeat,
                                     this.handleParentScroll.bind(this));

    // Scroll to the circle, after all animations have finished
    const EXPAND_ANIMATION_TIME_MS = 450;
    setTimeout(() => this.scrollBeatIntoView(), EXPAND_ANIMATION_TIME_MS);
  }

  private handleParentScroll() {
    const SCROLL_BACK_AFTER_MS = 2500;

    const timer = setTimeout(() => {
      if (!this.props.isSelected) {
        return;
      }

      this.scrollBeatIntoView();
    }, SCROLL_BACK_AFTER_MS);

    this.setState(({ scrollReturnTimer }) => {
      clearTimeout(scrollReturnTimer);

      return { scrollReturnTimer: timer };
    });
  }

  private triggerScrollEvent() {
    const beatElement = this.beatElement.current;

    beatElement.dispatchEvent(new Event('scroll'));
  }

  private scrollBeatIntoView() {
    const beatElement = this.beatElement.current;

    beatElement.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
    });
  }

  private scrollBeatToLeft() {
    const beatElement = this.beatElement.current;
    const beatListElement = beatElement.parentElement
                                       .parentElement;
    const beatListWidth = beatListElement.clientWidth;
    const BEAT_WIDTH_PX = 64;
    const BEAT_LEFT_MARGIN_PX = 16;

    // Scroll the beat list so the first beat is aligned left
    // This list gets given padding, so the first beat can scroll to the center
    beatListElement.scrollLeft = (beatListWidth / 2) - BEAT_WIDTH_PX + BEAT_LEFT_MARGIN_PX;
  }
}

export default Beat;
