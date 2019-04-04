import * as React from 'react';
import { configure, mount } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as sinon from 'sinon';
import BranchNav from './BranchNav';
import { getMockUIBar } from '../../utils/tests';
import { BeatListOrientation, BranchNavStatus } from '../../types/enums';
import { BranchNavProps, UIBeatType, BranchNavState, QueuedUIBeat } from '../../types/general';
import * as uiService from '../../services/ui/ui';

configure({ adapter: new Adapter() });

describe('BranchNav Component', () => {
  let defaultProps: BranchNavProps;
  let previewableState: BranchNavState;
  let clock: sinon.SinonFakeTimers;
  const TOP = BeatListOrientation.TOP;
  const BOTTOM = BeatListOrientation.BOTTOM;

  beforeEach(() => {
    defaultProps = {
      UIBars: [
        getMockUIBar(0),
        getMockUIBar(1),
      ],
      onClose: jest.fn(),
    };

    previewableState = {
      status: BranchNavStatus.PREVIEWABLE,
      beatLists: {
        [BeatListOrientation.TOP]: {
          queued: [],
          playing: null,
          selected: defaultProps.UIBars[0].beats[1],
          disabled: [defaultProps.UIBars[1].beats[0]],
        },
        [BeatListOrientation.BOTTOM]: {
          queued: [],
          playing: null,
          selected: defaultProps.UIBars[1].beats[0],
          disabled: [defaultProps.UIBars[0].beats[1]],
        },
      },
      beatPreviewTimer: null,
      lastFocusedBeatList: null,
      scrollLeftTarget: -1,
      scrollPriorityBeatList: null,
      mouseOverBeatList: BeatListOrientation.TOP,
    };

    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
  });

  it('clicking on a beat will update the state as expected', () => {
    const wrapper = mount(
      <BranchNav {...defaultProps} />,
    );

    const topListFirstBeat = wrapper.find('Beat').first();
    const topListSecondBeat = wrapper.find('Bar').first().find('Beat').last();
    const bottomListLastBeat = wrapper.find('Beat').last();
    const firstUIBar = getBeatFromWrapper(topListFirstBeat);
    const secondUIBar = getBeatFromWrapper(topListSecondBeat);
    const lastUIBeat = getBeatFromWrapper(bottomListLastBeat);

    expect(wrapper.state('status')).toBe(BranchNavStatus.CHOOSE_FIRST_BEAT);
    assertBLProps(wrapper, TOP);

    // Clicking a beat should progress the status
    topListFirstBeat.simulate('click');
    expect(wrapper.state('status')).toBe(BranchNavStatus.CHOOSE_SECOND_BEAT);
    assertBLProps(wrapper, TOP, firstUIBar);

    // Clicking that same beat should not progress the status, as you can't select the beat twice
    topListFirstBeat.simulate('click');
    expect(wrapper.state('status')).toBe(BranchNavStatus.CHOOSE_SECOND_BEAT);
    assertBLProps(wrapper, TOP, firstUIBar);

    // Similarly, clicking a different beat on the same list should not progress the state
    topListSecondBeat.simulate('click');
    expect(wrapper.state('status')).toBe(BranchNavStatus.CHOOSE_SECOND_BEAT);
    assertBLProps(wrapper, TOP, secondUIBar);
    assertBLProps(wrapper, BOTTOM, null, [secondUIBar]);

    // Clicking any beat in the next list should progress the state
    bottomListLastBeat.simulate('click');
    expect(wrapper.state('status')).toBe(BranchNavStatus.PREVIEWABLE);
    assertBLProps(wrapper, TOP, secondUIBar, [lastUIBeat]);
    assertBLProps(wrapper, BOTTOM, lastUIBeat, [secondUIBar]);
  });

  it('clicking preview and the back button should work as expected', () => {
    // Mock that starts the backwards playthrough after the forward one
    sinon.stub(uiService, 'previewBeatsWithOrders').callsFake(
      jest.fn(
        (queuedBeatOrders, callbackFn) => {
          setTimeout(callbackFn, queuedBeatOrders.length * 10 + 10); // 10ms for each beat
        },
      ),
    );

    const wrapper = mount(
      <BranchNav {...defaultProps} />,
    );
    wrapper.setState(previewableState);
    wrapper.mount();

    // Clicking the preview OR back button should set the state to PREVIEWING OR PREVIEWABLE
    function assertFooterButton(selector: string, expectedStatus: BranchNavStatus) {
      wrapper.find('BranchNavFooter').find(selector).first().simulate('click');
      expect(wrapper.state('status')).toBe(expectedStatus);
    }

    // Check the PREVIEW button changes the status as expected
    assertFooterButton('button.btn-success', BranchNavStatus.PREVIEWING);

    const topBeatList = previewableState.beatLists[TOP];
    const bottomBeatList = previewableState.beatLists[BOTTOM];
    const UIBars = defaultProps.UIBars;

    // We start animations after a short pause
    clock.tick(UIBars[0].beats[0].durationMs);

    // QUEUE ([bar][beat]): Top: [0][0], [0][1] -> Bottom: [1][1]
    assertBLProps(
      wrapper,
      TOP,
      topBeatList.selected,
      topBeatList.disabled,
      getQueuedUIBeat(UIBars[0].beats[0], BeatListOrientation.TOP),
      [...getQueuedUIBeats(UIBars[0].beats, BeatListOrientation.TOP)],
    );
    assertBLProps(
      wrapper,
      BOTTOM,
      bottomBeatList.selected,
      bottomBeatList.disabled,
      null,
      [getQueuedUIBeat(UIBars[1].beats[1], BeatListOrientation.BOTTOM)],
    );

    // Tick to the last beat in the queue
    clock.tick(UIBars[0].beats[1].durationMs + UIBars[1].beats[1].durationMs);

    // Ensure the playing beat is now on the bottom
    assertBLProps(
      wrapper,
      TOP,
      topBeatList.selected,
      topBeatList.disabled,
      null,
      [...getQueuedUIBeats(UIBars[0].beats, BeatListOrientation.TOP)],
    );
    assertBLProps(
      wrapper,
      BOTTOM,
      bottomBeatList.selected,
      bottomBeatList.disabled,
      getQueuedUIBeat(UIBars[1].beats[1], BeatListOrientation.BOTTOM),
      [getQueuedUIBeat(UIBars[1].beats[1], BeatListOrientation.BOTTOM)],
    );

    // Tick the first beat of the backwards playthrough and a separation delay
    clock.tick(UIBars[0].beats[0].durationMs + 10);

    // Ensure the queue is correct for the backwards playthrough
    assertBLProps(
      wrapper,
      TOP,
      topBeatList.selected,
      topBeatList.disabled,
      null,
      [...getQueuedUIBeats(UIBars[1].beats, BeatListOrientation.TOP)],
    );
    assertBLProps(
      wrapper,
      BOTTOM,
      bottomBeatList.selected,
      bottomBeatList.disabled,
      getQueuedUIBeat(UIBars[0].beats[0], BeatListOrientation.BOTTOM),
      [
        ...getQueuedUIBeats(UIBars[0].beats, BeatListOrientation.BOTTOM),
        getQueuedUIBeat(bottomBeatList.selected, BeatListOrientation.BOTTOM),
      ],
    );

    // Check BACK button works, stops the playthrough.
    assertFooterButton('button:not(.btn-success)', BranchNavStatus.PREVIEWABLE);
  });

  it('hides and shows through isHidden', () => {
    const wrapper = mount(
      <BranchNav {...defaultProps} isHidden={true} />,
    );

    // Passing in isHidden true will hide the element
    expect(wrapper.find('.modal').hasClass('show')).toBe(false);

    // Passing false does the opposite
    wrapper.setProps({ isHidden: false });
    wrapper.mount();
    expect(wrapper.find('.modal').hasClass('show')).toBe(true);
  });

  it('resets the state when clicking the close button, executes prop onClose', () => {
    const onCloseFn = jest.fn();
    const wrapper = mount(
      <BranchNav {...defaultProps} onClose={onCloseFn} />,
    );

    // Change some state so we can see it gets changed back
    wrapper.setState({ status: BranchNavStatus.CHOOSE_SECOND_BEAT, mouseOverBeatList: BeatListOrientation.BOTTOM });
    expect(wrapper.state('status')).toBe(BranchNavStatus.CHOOSE_SECOND_BEAT);
    expect(wrapper.state('mouseOverBeatList')).toBe(BeatListOrientation.BOTTOM);

    // Closing restores all original state
    wrapper.find('button.close').simulate('click');
    expect(onCloseFn).toBeCalledTimes(1);
    expect(wrapper.state('status')).toBe(BranchNavStatus.CHOOSE_FIRST_BEAT);
    expect(wrapper.state('mouseOverBeatList')).toBe(BeatListOrientation.TOP);
  });

  function assertBLProps(
    wrapper: any,
    orientation: BeatListOrientation,
    selected: UIBeatType | QueuedUIBeat = null,
    disabled: UIBeatType[] | QueuedUIBeat[] = [],
    playing: UIBeatType | QueuedUIBeat = null,
    queued: UIBeatType[] | QueuedUIBeat[] = [],
  ) {
    const beatList = wrapper.state('beatLists')[orientation];

    expect(beatList).toEqual({
      queued,
      playing,
      selected,
      disabled,
    });
  }

  function getBeatFromWrapper(wrapper: any) {
    return wrapper.props('UIBeat').UIBeat;
  }

  function getQueuedUIBeats(
    UIBeats: UIBeatType[],
    orientation: BeatListOrientation,
  ): QueuedUIBeat[] {
    return UIBeats.map(UIBeat => getQueuedUIBeat(UIBeat, orientation));
  }

  function getQueuedUIBeat(
    UIBeat: UIBeatType,
    orientation: BeatListOrientation,
  ): QueuedUIBeat {
    return {
      ...UIBeat,
      orientation,
    };
  }
});
