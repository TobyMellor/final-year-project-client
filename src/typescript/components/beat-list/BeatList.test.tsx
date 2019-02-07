import * as React from 'React';
import { configure, shallow, mount } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import BeatList, { BeatListProps } from './BeatList';
import * as sinon from 'sinon';
import ui from '../../config/ui';
import { getMockUIBar } from '../../utils/tests';
import { BeatListOrientation } from '../../types/enums';

configure({ adapter: new Adapter() });

describe('Bar Component', () => {
  let defaultProps: BeatListProps;

  beforeEach(() => {
    defaultProps = {
      UIBars: [
        getMockUIBar(1),
        getMockUIBar(2),
      ],
      queuedUIBeats: [],
      playingUIBeat: null,
      disabledUIBeats: [],
      orientation: BeatListOrientation.TOP,
      onBeatClick: jest.fn(),
      onBeatListScroll: jest.fn(),
    };
  });

  it('should only pass the important information to the corresponding bars', () => {
    const [firstUIBar, secondUIBar] = defaultProps.UIBars;
    const [firstBarFirstBeat, firstBarSecondBeat] = firstUIBar.beats;
    const [secondBarFirstBeat] = secondUIBar.beats;
    const wrapper = shallow(
      <BeatList {...defaultProps}
                queuedUIBeats={[firstBarFirstBeat]}
                playingUIBeat={firstBarSecondBeat}
                disabledUIBeats={[firstBarFirstBeat, secondBarFirstBeat]} />,
    );

    const firstBarWrapper = wrapper.find('Bar').first();
    const secondBarWrapper = wrapper.find('Bar').last();

    expect(firstBarWrapper.prop('queuedBeatOrders')).toEqual([firstBarFirstBeat.order]);
    expect(firstBarWrapper.prop('playingBeatOrder')).toEqual(firstBarSecondBeat.order);
    expect(firstBarWrapper.prop('disabledBeatOrders')).toEqual([firstBarFirstBeat.order]);

    expect(secondBarWrapper.prop('queuedBeatOrders')).toEqual([]);
    expect(secondBarWrapper.prop('playingBeatOrder')).toBe(-1);
    expect(secondBarWrapper.prop('disabledBeatOrders')).toEqual([secondBarFirstBeat.order]);
  });

  it('executes onBeatClick and adds scrollCallbackFn when a beat has been clicked', () => {
    const wrapper = mount(<BeatList {...defaultProps} />);
    const scrollCallbackFn = jest.fn();
    wrapper.setState({ scrollCallbackFn });

    // Initially, the callback should not be executed and the scrollCallbackFn
    // should be some empty function
    expect(defaultProps.onBeatClick).toBeCalledTimes(0);
    expect(wrapper.state('scrollCallbackFn')).toEqual(scrollCallbackFn);

    // After clicking, the callback should be executed and the scrollCallbackFn
    // should be received/updated from the clicked beat
    wrapper.find('.beat').first().simulate('click');
    expect(defaultProps.onBeatClick).toBeCalledTimes(1);
    expect(wrapper.state('scrollCallbackFn')).not.toEqual(scrollCallbackFn);
  });

  it('executes onBeatListScroll when scrolling, and should fire the scrollCallbackFn', () => {
    const wrapper = mount(<BeatList {...defaultProps} />);

    // Add the scrollCallbackFn. This callback would be delivered to us when
    // a beat is clicked, and is executed when we start scrolling to start a
    // timer in the beat component to scroll back after inactivity
    const scrollCallbackFn = jest.fn();
    wrapper.setState({ scrollCallbackFn });

    // Initially, both callbacks should not be executed
    expect(defaultProps.onBeatListScroll).toBeCalledTimes(0);
    expect(scrollCallbackFn).toBeCalledTimes(0);

    // After scrolling, onBeatListScroll and the scrollCallbackFn should be executed
    wrapper.find('.bars').simulate('scroll');
    expect(defaultProps.onBeatListScroll).toBeCalledTimes(1);
    expect(scrollCallbackFn).toBeCalledTimes(1);
  });
});
