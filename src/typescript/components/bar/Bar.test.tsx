import * as React from 'React';
import { configure, shallow, mount } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import Bar from './Bar';
import { getMockUIBar } from '../../utils/tests';
import { UIBeatType, BarProps } from '../../types/general';

configure({ adapter: new Adapter() });

describe('Bar Component', () => {
  let defaultProps: BarProps;

  beforeEach(() => {
    defaultProps = {
      UIBar: getMockUIBar(),
      queuedBeatOrders: [],
      playingBeatOrder: -1,
      selectedBeatOrder: -1,
      disabledBeatOrders: [],
      onBeatClick: jest.fn(),
    };
  });

  it('should control the z-index of beats on hover', () => {
    const wrapper = mount(<Bar {...defaultProps} />);

    // Initially, zIndexes are equal
    expect(wrapper.state('zIndexes')).toEqual([1, 1]);

    // Hovering over the first beat will make that appear higher
    wrapper.find('.beat').first().simulate('mouseenter');
    expect(wrapper.state('zIndexes')).toEqual([2, 1]);

    // Hovering over the last beat will make that appear higher
    // Also check that the property of the child is being updated
    wrapper.find('.beat').last().simulate('mouseenter');
    expect(wrapper.state('zIndexes')).toEqual([2, 3]);
    expect(wrapper.find('Beat').first().prop('zIndex')).toEqual(2);
    expect(wrapper.find('Beat').last().prop('zIndex')).toEqual(3);
  });

  it('executes onBeatClick when a beat has been clicked', () => {
    const wrapper = mount(<Bar {...defaultProps} />);

    // Initially, the callback should not be executed
    expect(defaultProps.onBeatClick).toBeCalledTimes(0);

    // After clicking, the callback should be executed
    wrapper.find('.beat').first().simulate('click');
    expect(defaultProps.onBeatClick).toBeCalledTimes(1);
  });

  it('should add .queued if any beat is queued', () => {
    const queuedBeatOrder = defaultProps.UIBar.beats[1].order; // Take any order in this bar
    const wrapperNotQueued = shallow(<Bar {...defaultProps} queuedBeatOrders={[999]} />);
    const wrapperQueued = shallow(<Bar {...defaultProps} queuedBeatOrders={[queuedBeatOrder]} />);

    // If none of the beats in the bar are queued, it should not have the queued class
    expect(wrapperNotQueued.hasClass('queued')).toBe(false);

    expect(wrapperQueued.hasClass('queued')).toBe(true);
  });

  it('should add .queued if any beat is queued', () => {
    const queuedBeatOrder = defaultProps.UIBar.beats[1].order; // Take any order in this bar
    const wrapperNotQueued = shallow(<Bar {...defaultProps} queuedBeatOrders={[999]} />);
    const wrapperQueued = shallow(<Bar {...defaultProps} queuedBeatOrders={[queuedBeatOrder]} />);

    // If none of the beats in the bar are queued, it should not have the queued class
    expect(wrapperNotQueued.hasClass('queued')).toBe(false);

    expect(wrapperQueued.hasClass('queued')).toBe(true);
  });

  it('should set isQueued, isPlaying, isSelected and isDisabled on child beats', () => {
    const [firstBeatOrder, secondBeatOrder] = defaultProps.UIBar.beats.map((beat: UIBeatType) => (
      beat.order
    ));
    const wrapper = shallow(
      <Bar {...defaultProps}
           queuedBeatOrders={[firstBeatOrder]}
           playingBeatOrder={secondBeatOrder}
           selectedBeatOrder={firstBeatOrder}
           disabledBeatOrders={[firstBeatOrder, secondBeatOrder]} />,
    );
    const beatElements = wrapper.find('Beat');
    const firstBeat = beatElements.first();
    const secondBeat = beatElements.last();

    expect(firstBeat.prop('isQueued')).toBe(true);
    expect(secondBeat.prop('isQueued')).toBe(false);

    expect(firstBeat.prop('isPlaying')).toBe(false);
    expect(secondBeat.prop('isPlaying')).toBe(true);

    expect(firstBeat.prop('isSelected')).toBe(true);
    expect(secondBeat.prop('isSelected')).toBe(false);

    expect(firstBeat.prop('isDisabled')).toBe(true);
    expect(secondBeat.prop('isDisabled')).toBe(true);
  });
});
