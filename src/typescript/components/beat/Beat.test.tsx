import * as React from 'React';
import { configure, shallow, mount } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import Beat, { BeatProps } from './Beat';
import * as sinon from 'sinon';
import ui from '../../config/ui';

configure({ adapter: new Adapter() });

describe('Beat Component', () => {
  let defaultProps: BeatProps;
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    defaultProps = {
      UIBeat: {
        order: 5,
        barOrder: 9,
        timbreNormalized: 0.5,
        loudnessNormalized: 0.5,
        durationMs: 10,
      },
      isQueued: false,
      isPlaying: false,
      isSelected: false,
      isDisabled: false,
      zIndex: 0,
      onBeatMouseEnter: jest.fn(),
      onBeatClick: jest.fn(),
    };

    ui.beat.availableColours = ['colour1', 'colour2'];
    ui.beat.availableSizes = ['size1', 'size2'];
    ui.beat.expandAnimationDurationMs = 500;
    ui.beat.scrollBackAfterMs = 1500;

    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
  });

  it('rejects non-normalized timbre/loudness values', () => {
    const modifyAndGetWrapperFn = (
      property: 'timbreNormalized' | 'loudnessNormalized',
      value: number,
    ) => {
      const UIBeat = { ...defaultProps.UIBeat };
      UIBeat[property] = value;

      return shallow(<Beat {...defaultProps} UIBeat={UIBeat} />);
    };

    const invalidTimbreFn = () => modifyAndGetWrapperFn('timbreNormalized', -5);
    const invalidLoudnessFn = () => modifyAndGetWrapperFn('loudnessNormalized', 4);
    const validTimbreFn = () => modifyAndGetWrapperFn('timbreNormalized', 0);
    const validLoudnessFn = () => modifyAndGetWrapperFn('loudnessNormalized', 1);

    // Only values between 0 and 1 should be allowed
    expect(invalidTimbreFn).toThrowError();
    expect(invalidLoudnessFn).toThrowError();
    expect(validTimbreFn).not.toThrowError();
    expect(validLoudnessFn).not.toThrowError();
  });

  it('scrolls the first beat to the left', () => {
    // @ts-ignore
    const scrollBeatToLeftFn = Beat.prototype.scrollBeatToLeft = jest.fn();
    const wrapper = mount(<Beat {...defaultProps} />);

    // If it's not the first beat, the beat should not be scrolled
    expect(scrollBeatToLeftFn).toBeCalledTimes(0);

    // Change the order so this beat becomes the first one
    wrapper.setProps({ UIBeat: { ...defaultProps.UIBeat, order: 0 } });
    wrapper.unmount().mount();

    // The beat should be scrolled if it's the first beat
    expect(scrollBeatToLeftFn).toBeCalledTimes(1);
  });

  it('executes onBeatMouseOver when hovering over a beat', () => {
    const handleBeatMouseOverFn = jest.fn();
    const wrapper = mount(<Beat {...defaultProps} onBeatMouseEnter={handleBeatMouseOverFn} />);

    wrapper.simulate('mouseenter');

    // Hovering over once should execute the callback once
    expect(handleBeatMouseOverFn).toBeCalledTimes(1);
  });

  it('executes onBeatClick when clicking a beat', () => {
    const handleBeatClickFn = jest.fn();
    const wrapper = mount(<Beat {...defaultProps} onBeatClick={handleBeatClickFn} />);

    wrapper.simulate('click');

    // Clicking once should execute the callback once
    expect(handleBeatClickFn).toBeCalledTimes(1);
  });

  it('should change the circle colour and size relative to timbre and loudness', () => {
    function assertSizeAndColour(
      timbreNormalized: number,
      loudnessNormalized: number,
      expectedColourIndex: number,
      expectedSizeIndex: number,
    ) {
      const UIBeat = { ...defaultProps.UIBeat, timbreNormalized, loudnessNormalized };
      const wrapper = shallow(<Beat {...defaultProps} UIBeat={UIBeat} />);
      const circle = wrapper.find('.circle.circle-solid');

      expect(circle.hasClass(`circle-${ui.beat.availableColours[expectedColourIndex]}`)).toBe(true);
      expect(circle.hasClass(`circle-${ui.beat.availableSizes[expectedSizeIndex]}`)).toBe(true);
    }

    assertSizeAndColour(0.25, 0.75, 0, 1);
    assertSizeAndColour(0.75, 0.25, 1, 0);
  });

  it('should scroll back after the expansion animation has finished', () => {
    // @ts-ignore
    const scrollBeatIntoViewFn = Beat.prototype.scrollBeatIntoView = jest.fn();
    const wrapper = mount(<Beat {...defaultProps} />);

    // Simulate a click which starts the expansion animation
    wrapper.simulate('click');

    // Before the duration, the scroll fn should not be called
    clock.tick(ui.beat.expandAnimationDurationMs - 1);
    expect(scrollBeatIntoViewFn).toBeCalledTimes(0);

    // After the duration, the scroll fn should be called
    clock.tick(1);
    expect(scrollBeatIntoViewFn).toBeCalledTimes(1);
  });

  it('should scroll back if there\'s been no activity for a while', () => {
    let scrollCallbackFn: () => void;
    const wrapper = mount(<Beat {...defaultProps} onBeatClick={
      (_, parentScrollCallbackFn) => {
        scrollCallbackFn = parentScrollCallbackFn;
      }
    } />);

    // @ts-ignore
    const scrollBeatIntoViewFn = Beat.prototype.scrollBeatIntoView = jest.fn();

    // Simulate click. This runs scrollBeatIntoView, which will give us the
    // scrollCallbackFn
    wrapper.simulate('click');

    // Has not scrolled beat into focus before the expansion animation
    expect(scrollBeatIntoViewFn).toBeCalledTimes(0);

    // Scrolls when expansion animation finishes
    clock.tick(ui.beat.expandAnimationDurationMs);
    expect(scrollBeatIntoViewFn).toBeCalledTimes(1);

    function assertScrollBackAfter(baseTimesCalled: number, shouldScrollBack: boolean) {
      // Run the scrollCallbackFn, this is simulating the parent being scrolled
      scrollCallbackFn();

      // Before the duration, the beat should not be re-focused yet
      clock.tick(ui.beat.scrollBackAfterMs - 1);
      expect(scrollBeatIntoViewFn).toBeCalledTimes(baseTimesCalled);

      // After the duration (no activity), beat should be re-focused
      clock.tick(1);
      expect(scrollBeatIntoViewFn)
        .toBeCalledTimes(shouldScrollBack ? baseTimesCalled + 1 : baseTimesCalled);
    }

    // When it's not the selected beat, it should not scroll back after no activity
    assertScrollBackAfter(1, false);

    // Make it the selected beat, and try again
    wrapper.setProps({ isSelected: true });
    assertScrollBackAfter(1, true);
  });
});
