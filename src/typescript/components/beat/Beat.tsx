import * as React from 'react';
import cx from 'classnames';
import config from '../../config';
import * as utils from '../../utils/misc';
import { BeatProps, BeatState } from '../../types/general';

class Beat extends React.Component<BeatProps, BeatState> {
  private beatElement: React.RefObject<HTMLDivElement>;

  constructor(props: BeatProps) {
    super(props);

    const { timbreNormalized, loudnessNormalized } = props.UIBeat;

    // Only accept normalized Timbre and Loudness values between 0 and 1
    if (!utils.isNumberNormalized(timbreNormalized)
        || !utils.isNumberNormalized(loudnessNormalized)) {
      throw new Error('Attempted to render beats from un-normalized values!');
    }

    this.beatElement = React.createRef();
    this.state = {
      scrollReturnTimer: null,
    };
  }

  componentDidMount() {
    const { isInitiallyCentered } = this.props;

    // Ensure that the first beat is initially visible to the left
    // of the beat list
    if (isInitiallyCentered) {
      this.scrollBeatIntoView();
    }
  }

  shouldComponentUpdate(nextProps: BeatProps) {
    return utils.shouldUpdate(
      this.props,
      nextProps,
      ['isQueued', 'isPlaying', 'isSelected', 'isDisabled', 'zIndex'],
    );
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
           onMouseEnter={this.handleMouseEnter.bind(this)}
           onClick={this.handleClick.bind(this)}>
        <span className="circle circle-hollow"></span>
        <span className={circleSolidClassNames}></span>
        <div className="beat-order-container">
          <span>{order + 1}</span>
        </div>
      </div>
    );
  }

  /**
   * Give the beat a different colour depending on it's timbre value
   *
   * @param timbreNormalized The timbre of the beat, between 0 and 1
   */
  private getCircleColour(timbreNormalized: number): string {
    return this.getCorrespondingClassName(config.ui.beat.availableColours, timbreNormalized);
  }

  /**
   * Give the beat a different size depending on it's loudness value
   *
   * @param loudnessNormalized The loudness of the beat, between 0 and 1
   */
  private getCircleSize(loudnessNormalized: number): string {
    return this.getCorrespondingClassName(config.ui.beat.availableSizes, loudnessNormalized);
  }

  /**
   * Given an array of possible values and a number between 0 and 1:
   * get the corresponding value in the array.
   *
   * Then, prefix the chosen value with a CSS prefix: 'circle-'
   *
   * @param array Possible CSS classes, appearing after circle-
   * @param numberNormalized A value between 0 and 1 used to choose the value
   */
  private getCorrespondingClassName(array: string[], numberNormalized: number): string {
    const index = Math.round((array.length - 1) * numberNormalized);
    const element = array[index];
    const className = `circle-${element}`;

    return className;
  }

  private handleMouseEnter() {
    this.props.onBeatMouseEnter();
  }

  private handleClick() {
    const { isDisabled, UIBeat, onBeatClick } = this.props;

    // Ignore the click if the beat's disabled
    if (isDisabled) {
      return;
    }

    // Fake a scroll event immediately so we can start rotating
    // before the expansion animation
    this.triggerScrollEvent();

    onBeatClick(UIBeat, this.handleParentScroll.bind(this));

    // Scroll to the circle, after all animations have finished
    setTimeout(() => this.scrollBeatIntoView(), config.ui.beat.expandAnimationDurationMs);
  }

  /**
   * Keeps a timer. If the parent beat list hasn't scrolled for some time,
   * then scroll this beat  back into view (if it's still selected)
   */
  private handleParentScroll() {
    const timer = setTimeout(() => {
      if (!this.props.isSelected) {
        return;
      }

      // After some time, scroll the beat back into view (if it's still selected)
      this.scrollBeatIntoView();
    }, config.ui.beat.scrollBackAfterMs);

    // Cancel and replace any scroll timer that may exist with this one
    // so the countdown begins again
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

    if (!beatElement) {
      return;
    }

    beatElement.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
    });
  }
}

export default Beat;
