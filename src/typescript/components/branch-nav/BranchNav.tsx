import * as React from 'react';
import BeatList from '../beat-list/BeatList';
import Translator from '../../../translations/Translator';
import cx from 'classnames';
import * as uiService from '../../services/ui/ui';
import * as utils from '../../utils/misc';
import * as conversions from '../../utils/conversions';
import {
  BeatListOrientation as Orientation,
  BranchNavStatus as Status,
  BezierCurveType,
  BranchNavStatus,
} from '../../types/enums';
import {
  BeatListInfo,
  QueuedUIBeat,
  UIBeatType,
  UIBarType,
  BranchNavProps,
  BranchNavState,
} from '../../types/general';
import BranchNavFooter from './BranchNavFooter';
import config from '../../config';

const TOP = Orientation.TOP;
const BOTTOM = Orientation.BOTTOM;

class BranchNav extends React.Component<BranchNavProps, BranchNavState> {
  private scrollTrackerContainerElement: React.RefObject<HTMLDivElement>;
  private scrollTrackerElement: React.RefObject<HTMLDivElement>;
  private branchNavBodyElement: React.RefObject<HTMLDivElement>;
  private topBeatListElement: React.RefObject<BeatList>;
  private bottomBeatListElement: React.RefObject<BeatList>;

  constructor(props: BranchNavProps) {
    super(props);

    this.scrollTrackerElement = React.createRef();
    this.scrollTrackerContainerElement = React.createRef();
    this.branchNavBodyElement = React.createRef();
    this.topBeatListElement = React.createRef();
    this.bottomBeatListElement = React.createRef();

    this.state = this.getInitialState();
  }

  private getInitialState(): BranchNavState {
    function defaultBeatListInfo(): BeatListInfo {
      return {
        queued: [],
        playing: null,
        selected: null,
        disabled: [],
      };
    }

    return {
      status: Status.NOT_YET_SHOWN,
      beatLists: {
        [TOP]: defaultBeatListInfo(),
        [BOTTOM]: defaultBeatListInfo(),
      },
      lastFocusedBeatList: null,
      scrollLeftTarget: -1,
      mouseOverBeatList: TOP,
      beatPreviewTimer: null,
      beatPathTimer: null,
    };
  }

  shouldComponentUpdate(nextProps: BranchNavProps, nextState: BranchNavState) {
    if (this.props.UIBars.length !== nextProps.UIBars.length) {
      return true;
    }

    if (this.props.isHidden !== nextProps.isHidden) {
      return true;
    }

    if (this.state.status !== nextState.status) {
      return true;
    }

    // Check if each beatList's content is the same
    for (const orientation in this.state.beatLists) {
      const hasBeatListUpdated = utils.hasUpdated(
        this.state.beatLists[orientation],
        nextState.beatLists[orientation],
        ['centered', 'queued', 'playing', 'selected', 'disabled'],
      );

      if (hasBeatListUpdated) {
        return true;
      }
    }

    return false;
  }

  componentWillUpdate({ isHidden }: BranchNavProps, { status }: BranchNavState) {
    if (this.props.isHidden !== isHidden) {
      const playthroughPercent = uiService.getPlaythroughPercent();

      if (!isHidden) {
        this.handleOnShow(playthroughPercent, status);
      } else {
        this.handleOnClose();
      }
    }
  }

  componentWillUnmount() {
    clearTimeout(this.state.beatPreviewTimer);
    clearTimeout(this.state.beatPathTimer);
  }

  render() {
    const { UIBars, isHidden, onRequestClose } = this.props;
    const { status, beatLists } = this.state;
    const helperTextForStatus = this.getHelperTextForStatus(status);
    const branchNavClassNames = cx(
      'modal',
      {
        show: !isHidden,
      },
    );
    const branchNavBodyClassNames = cx(
      'bottom-branch-nav-body',
      {
        previewable: status === Status.PREVIEWABLE,
        previewing: status === Status.PREVIEWING,
      },
    );

    const getBeatListElement = (orientation: Orientation) => {
      const { initiallyCentered, queued, playing, disabled } = beatLists[orientation];
      const ref = this.getBeatListElement(orientation);
      const isHidden = orientation === BOTTOM &&
                       status === Status.CHOOSE_FIRST_BEAT;

      return (
        <BeatList
          ref={ref}
          UIBars={UIBars}
          initiallyCenteredUIBeat={initiallyCentered}
          queuedUIBeats={queued}
          playingUIBeat={playing}
          disabledUIBeats={disabled}
          orientation={orientation}
          isHidden={isHidden}
          onBeatClick={
            (orientation, UIBeat) => {
              return this.handleBeatClick(orientation, UIBeat);
            }
          }
          onBeatListScroll={
            (orientation, element) => (
              this.handleBeatListScroll(orientation, element)
            )
          }
        />
      );
    };

    return (
      <div className={branchNavClassNames}
           tabIndex={-1}
           role="dialog">
        <div className="modal-dialog bottom-branch-nav" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Create a Branch</h5>
              <h3 className="modal-title-feedback">{helperTextForStatus}</h3>
              <button type="button" className="close" data-dismiss="modal" onClick={() => onRequestClose(status)}>
                <span>&times;</span>
              </button>
            </div>
            <div className="modal-body p-0">
              <div ref={this.branchNavBodyElement}
                   className={branchNavBodyClassNames}
                   onMouseOver={this.handleMouseOver.bind(this)}>
                {getBeatListElement(TOP)}
                {getBeatListElement(BOTTOM)}
              </div>
              <div ref={this.scrollTrackerContainerElement}
                   className="scroll-tracker"
                   onScroll={this.handleScrollTracker.bind(this)}>
                <div ref={this.scrollTrackerElement}>...</div>
              </div>
            </div>
            <BranchNavFooter status={status}
                             onPreviewClick={() => this.handlePreviewClick()}
                             onPreviewingBackClick={() => this.handlePreviewingBackClick()}
                             onPreviewingCreateBranchClick={() => this.handleCreateBranchClick()} />
          </div>
        </div>
      </div>
    );
  }

  private handleOnShow(playthroughPercent: number, status: Status) {
    if (status === Status.NOT_YET_SHOWN) {
      this.setState({ status: Status.CHOOSE_FIRST_BEAT });
    }

    const startScrollLeft = this.getScrollLeftFromScrollPercent(playthroughPercent);
    const targetScrollLeft = this.getLastFocusedScrollLeft();
    const scrollTrackerContainerElement = this.scrollTrackerContainerElement.current;

    // Snap the scrollTracker to wherever they are in the song
    scrollTrackerContainerElement.scrollLeft = startScrollLeft;

    this.smoothlyCatchUpScrollTracker(targetScrollLeft);
  }

  private handleOnClose() {
    uiService.removePreviewBezierCurve();
  }

  /**
   * Retrieve the instruction text in the modal header depending
   * on the current status.
   *
   * @param status The status of the beatList
   */
  private getHelperTextForStatus(status: Status): string {
    return Translator.react.bottom_branch_nav[status];
  }

  /**
   * Change the selected beat, and make that beat disabled on the other beat list.
   *
   * Perform different actions for different states:
   *   - CHOOSE_FIRST_BEAT:
   *       - Update status to CHOOSE_SECOND_BEAT
   *       - Smoothly scroll the bottom nav to the correct position
   *   - CHOOSE_SECOND_BEAT:
   *       - Update status to PREVIEWABLE
   *
   * @param orientation The orientation of the beat list (TOP or BOTTOM)
   * @param selectedUIBeat The beat that's just beens elected
   */
  private handleBeatClick(orientation: Orientation, selectedUIBeat: UIBeatType) {
    function getNextStatus(currentStatus: Status): Status {
      switch (currentStatus) {
        case Status.PREVIEWABLE:
          return Status.PREVIEWABLE;
        case Status.CHOOSE_SECOND_BEAT:
          // Ensure they don't proceed if they just chose another from the top
          if (orientation === BOTTOM) {
            return Status.PREVIEWABLE;
          }
        case Status.CHOOSE_FIRST_BEAT:
          return Status.CHOOSE_SECOND_BEAT;
      }
    }

    this.setState(({ beatLists, status }) => {
      const nextStatus = getNextStatus(status);
      const isOrientationTop = orientation === TOP;

      if (isOrientationTop) {
        beatLists[TOP].selected = selectedUIBeat;
        beatLists[BOTTOM].disabled = [selectedUIBeat];
      } else {
        beatLists[BOTTOM].selected = selectedUIBeat;
        beatLists[TOP].disabled = [selectedUIBeat];
      }

      return {
        beatLists,
        status: nextStatus,
      };
    });

    if (this.state.status === Status.CHOOSE_FIRST_BEAT) {
      this.setState(({ beatLists }) => {
        const beatListsCopy = utils.deepCopy(beatLists);
        beatListsCopy[BOTTOM].initiallyCentered = beatListsCopy[TOP].selected;

        return {
          beatLists: beatListsCopy,
          lastFocusedBeatList: BOTTOM,
        };
      });
    }
  }

  /**
   * Set's the status to PREVIEWING, and starts playing
   * the beat paths
   */
  private handlePreviewClick() {
    this.setState(({ beatPreviewTimer }) => {
      clearTimeout(beatPreviewTimer);

      return {
        status: Status.PREVIEWING,
        beatPreviewTimer: null,
      };
    });

    const beatLists = this.state.beatLists;
    const topSelectedBeat = beatLists[TOP].selected;
    const bottomSelectedBeat = beatLists[BOTTOM].selected;
    const topSelectedBar = this.getBarFromBeat(topSelectedBeat);
    const bottomSelectedBar = this.getBarFromBeat(bottomSelectedBeat);

    // Plays the path centered on the selected beat, from the
    // TOP beat list to the BOTTOM
    this.playBeatPaths(topSelectedBar,
                       bottomSelectedBar,
                       topSelectedBeat,
                       bottomSelectedBeat,
                       TOP,
                       BOTTOM);

    // When we start playing, change the previewBezierCurve
    setTimeout(() => {
      if (this.state.status !== Status.PREVIEWING) {
        return;
      }

      const [topPercent, bottomPercent] = uiService.getUIBeatPercents(topSelectedBeat, bottomSelectedBeat);
      uiService.previewBezierCurve(
        BezierCurveType.PREVIEW,
        topPercent,
        bottomPercent,
      );

      const needlePercent = this.state.lastFocusedBeatList === TOP ? topPercent : bottomPercent;
      uiService.setNeedleRotation(needlePercent);
    }, conversions.secsToMs(config.audio.schedulingDelaySecs));
  }

  /**
   * Set's the status to PREVIEWABLE, clears the audio, clears the playing beat and
   * clears all of the queued beats.
   */
  private handlePreviewingBackClick() {
    this.setState(({ beatPreviewTimer, beatLists }) => {
      clearTimeout(beatPreviewTimer);

      const beatListsCopy = utils.deepCopy(beatLists);

      for (const orientation in beatListsCopy) {
        beatListsCopy[orientation].playing = null;
        beatListsCopy[orientation].queued = [];
      }

      return {
        status: Status.PREVIEWABLE,
        beatPreviewTimer: null,
        beatLists: beatListsCopy,
      };
    });

    uiService.stopPlaying();
  }

  private async handleCreateBranchClick() {
    const { status, beatLists } = this.state;
    const { onRequestClose } = this.props;

    if (status === Status.PREVIEWING) {
      uiService.stopPlaying();
    }

    const firstBeatOrder = beatLists[TOP].selected.order;
    const secondBeatOrder = beatLists[BOTTOM].selected.order;
    uiService.createBranch(firstBeatOrder, secondBeatOrder);

    this.setState({ status: BranchNavStatus.FINISHED }, () => onRequestClose(Status.FINISHED));
  }

  /**
   * Identifies which beat list the user is hovering over. This is used so that
   * we only automatically scrollBack and animate the canvas when the user is
   * focused on that beatList.
   *
   * @param absoluteMousePosY The mouses absolute position on the page
   */
  private handleMouseOver({ pageY: absoluteMousePosY }: React.MouseEvent) {
    const status = this.state.status;

    // If only one BeatList is shown, don't bother calculating
    if (status === Status.NOT_YET_SHOWN || status === Status.CHOOSE_FIRST_BEAT) {
      return;
    }

    const target = this.branchNavBodyElement.current;
    const { top: absoluteTargetPosY, height: targetHeight } = target.getBoundingClientRect();
    const relativeMousePosY = absoluteMousePosY - absoluteTargetPosY;
    const isHoveringOverTop = relativeMousePosY <= targetHeight / 2;

    this.setState({
      mouseOverBeatList: isHoveringOverTop ? TOP : BOTTOM,
    });
  }

  /**
   * Attempts to keep the canvas rotation in sync when scrolling through a beat list
   *
   * @param orientation The orientation of the beat list that was scrolled
   * @param element The beat list element that was scrolled
   */
  private handleBeatListScroll(
    orientation: Orientation,
    { scrollLeft: newScrollLeftTarget, scrollWidth }: Element,
  ) {
    const {
      lastFocusedBeatList,
      scrollLeftTarget,
      mouseOverBeatList,
    } = this.state;

    // Don't scroll the beat list if the user's mouse is not hovering over it
    if (mouseOverBeatList && mouseOverBeatList !== orientation) {
      console.debug('Mouse over blocking scrolling', mouseOverBeatList, orientation);
      return;
    }

    // Update the lastKnownScrollLeft and lastFocusedBeatList
    this.setState(({ beatLists }) => {
      const beatListsCopy = utils.deepCopy(beatLists);
      beatListsCopy[orientation].lastKnownScrollLeft = newScrollLeftTarget;

      return {
        beatLists: beatListsCopy,
        lastFocusedBeatList: orientation,
      };
    });

    // If it's the first time we're in this function, initialize the scrollTracker
    // by giving it the same width as the beat lists
    if (!lastFocusedBeatList) {
      const scrollTrackerElement = this.scrollTrackerElement.current;
      scrollTrackerElement.style.width = `${scrollWidth}px`;
    }

    if (scrollLeftTarget === -1) {
      if (!lastFocusedBeatList || lastFocusedBeatList === orientation) {
        // Keep the scroll tracker in sync with the beat list
        const scrollTrackerContainerElement = this.scrollTrackerContainerElement.current;
        scrollTrackerContainerElement.scrollLeft = newScrollLeftTarget;
      } else {
        // The focused beat list has changed, set the state for next time
        this.smoothlyCatchUpScrollTracker(newScrollLeftTarget);
      }
    }
  }

  /**
   * Calls .scrollTo() to smoothly scroll scrollTrackerContainerElement
   * to attempt to catch up with (sync up with) the beat list
   *
   * This function will be repeatedly called until the newScrollLeftTarget
   * roughly equals the beat list's scrollLeft property
   *
   * @param newScrollLeftTarget Where to scroll to, -1 if we've caught up already
   */
  private smoothlyCatchUpScrollTracker(newScrollLeftTarget: number) {
    const scrollTrackerContainerElement = this.scrollTrackerContainerElement.current;

    // Scroll the scrollTracker smoothly to the new position if a new target is set
    this.setState({
      scrollLeftTarget: newScrollLeftTarget,
    }, () => {
      if (newScrollLeftTarget !== -1 && process.env.NODE_ENV !== 'test') {
        scrollTrackerContainerElement.scrollTo({
          left: newScrollLeftTarget,
          behavior: 'smooth',
        });
      }
    });
  }

  /**
   * Handles the invisible scrollTracker's scroll event, and directly
   * updates the canvas rotation.
   *
   * It will also check if we've caught up to our desired target. If we have,
   * we retrieve a new scroll left target and check if we've caught up to that.
   * If we haven't, we'll smoothly attempt to catch up the scroll tracker and repeat.
   */
  private handleScrollTracker() {
    // The scrollTracker can be moved during initialization, don't allow animations to take place
    const { scrollLeftTarget, beatLists, lastFocusedBeatList, status } = this.state;
    if (status === Status.NOT_YET_SHOWN) {
      console.debug('NOT_YET_SHOWN blocking scroll');
      return;
    }

    if (status === Status.PREVIEWING) {
      this.handlePreviewingBackClick();
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = this.scrollTrackerContainerElement.current;
    const isCaughtUpToTarget = this.isScrollTrackerCaughtUp(scrollLeft, scrollLeftTarget);

    // Check if we've caught up to the last scrollLeft target that was set
    if (isCaughtUpToTarget) {
      const newScrollLeftTarget = this.getLastFocusedScrollLeft();
      const isCaughtUpToNewTarget = this.isScrollTrackerCaughtUp(scrollLeft, newScrollLeftTarget);

      // Set a new scrollLeft target if the scrollTracker is still not synced
      this.setState({
        scrollLeftTarget: isCaughtUpToNewTarget ? -1 : newScrollLeftTarget,
      }, () => {
        if (!isCaughtUpToNewTarget) {
          this.smoothlyCatchUpScrollTracker(newScrollLeftTarget);
        }
      });
    }

    if (status === Status.CHOOSE_FIRST_BEAT) {
      beatLists[BOTTOM].lastKnownScrollLeft = beatLists[TOP].lastKnownScrollLeft;
    }

    const scrollTrackerScrollPercent = this.getScrollPercentFromScrollLeft(scrollLeft, scrollWidth, clientWidth);
    const getExactBeatListScrollPercent = (orientation: Orientation): number => {
      // If it's the first stage, use the scroll tracker as we know it's in sync
      if (status === Status.CHOOSE_FIRST_BEAT) {
        return scrollTrackerScrollPercent;
      }

      // If the scrollTracker and the BeatList are in sync, use the scrollTrackerScrollPercent to avoid wobbling
      const isCaughtUp = orientation === lastFocusedBeatList && scrollLeft === this.getLastFocusedScrollLeft();
      if (isCaughtUp) {
        return scrollTrackerScrollPercent;
      }

      // For the BeatList that's not utilising the scroll tracker, get the exact up-to-date percentage
      const scrollableBeatListElement = this.getScrollableBeatListElement(orientation);
      return this.getScrollPercentFromScrollLeft(scrollableBeatListElement.scrollLeft, scrollWidth, clientWidth);
    };

    const topBeatListExactScrollPercent = getExactBeatListScrollPercent(TOP);
    const bottomBeatListExactScrollPercent = getExactBeatListScrollPercent(BOTTOM);

    uiService.previewBezierCurve(
      BezierCurveType.SCAFFOLD,
      topBeatListExactScrollPercent,
      bottomBeatListExactScrollPercent,
    );
    uiService.setSongCircleRotation(scrollTrackerScrollPercent);
    uiService.setNeedleRotation(scrollTrackerScrollPercent);
  }

  /**
   * From the width of an element, and the current scroll position,
   * identify the percentage that the user has scrolled in that element.
   *
   * @param scrollLeft The element's .scrollLeft property
   * @param scrollWidth The element's .scrollWidth
   * @param clientWidth The element's .clientWidth
   */
  private getScrollPercentFromScrollLeft(
    scrollLeft: number,
    scrollWidth: number,
    clientWidth: number,
  ): number {
    const totalScrollWidth = this.getTotalScrollWidth(scrollWidth, clientWidth);
    const scrollDecimal = scrollLeft / totalScrollWidth;
    const scrollPercentage = conversions.decimalToPercentage(scrollDecimal);

    return scrollPercentage;
  }

  /**
   * From a percentage, obtain the corresponding scrollLeft value of a
   * scrollable BeatList
   *
   * @param scrollPercent How far they've scrolled through the BeatList
   */
  private getScrollLeftFromScrollPercent(scrollPercent: number) {
    const { scrollWidth, clientWidth } = this.getScrollableBeatListElement(TOP);
    const totalScrollWidth = this.getTotalScrollWidth(scrollWidth, clientWidth);
    const decimal = conversions.percentageToDecimal(scrollPercent);

    return totalScrollWidth * decimal;
  }

  private getTotalScrollWidth(scrollWidth: number, clientWidth: number) {
    return scrollWidth - clientWidth;
  }

  /**
   * Checks if the current .scrollLeft ROUGHLY equals the target
   * scroll position.
   *
   * We don't care if it's exactly caught up, since it probably never will be.
   * If the threshold is a small number, we'll be constantly calling this. By
   * the time we do, the scroll position is likely to have changed.
   *
   * The user won't notice small jumps.
   *
   * @param scrollLeft The element's .scrollLeft property
   * @param scrollLeftTarget The value that .scrollLeft should roughly be
   */
  private isScrollTrackerCaughtUp(scrollLeft: number, scrollLeftTarget: number | null): boolean {
    // If we're in the process of hiding the BranchNav, don't attempt to catch up
    if (this.props.isHidden) {
      return false;
    }

    const THRESHOLD = 1000;
    return !scrollLeftTarget || Math.abs(scrollLeft - scrollLeftTarget) <= THRESHOLD;
  }

  /**
   * Queues and animates the beat's in a path that orients around the selected beat
   *
   * @param originBar The bar containing the originBeat of the branch
   * @param destinationBar The bar containing the destinationBeat of the branch
   * @param originBeat The origin beat of the branch (one of the selected beat)
   * @param destinationBeat The destination beat of the branch (one of the selected beat)
   * @param startOrientation The orientation of the beat list containing the originBeat
   * @param endOrientation The opposite of startOrientation
   */
  private playBeatPaths(
    originBar: UIBarType,
    destinationBar: UIBarType,
    originBeat: UIBeatType,
    destinationBeat: UIBeatType,
    startOrientation: Orientation,
    endOrientation: Orientation,
  ) {
    const beatsBeforeOrigin = this.getAdjacentBeats(
      originBar,
      originBeat,
      true,
      startOrientation,
    );
    const beatsAfterDestination = this.getAdjacentBeats(
      destinationBar,
      destinationBeat,
      false,
      endOrientation,
    );
    const beatPath = [
      ...beatsBeforeOrigin,
      { ...originBeat, orientation: startOrientation }, // originBeat: QueuedUIBeat
      ...beatsAfterDestination,
    ];

    const beatPathTimer = setTimeout(() => {
      this.updatePlayingBeats(beatPath);
      this.updateQueuedBeats(beatPath);
    }, conversions.secsToMs(config.audio.schedulingDelaySecs));
    this.setState({ beatPathTimer });

    // Play the opposite branch
    const callbackFn = () => {
      const status = this.state.status;

      // If we're still previewing when the beats have finished
      if (status === Status.PREVIEWING) {
        // Reverse the originBeat and destinationBeat
        this.playBeatPaths(destinationBar,
                           originBar,
                           destinationBeat,
                           originBeat,
                           endOrientation,
                           startOrientation);
      }
    };

    uiService.previewBeatsWithOrders(beatsBeforeOrigin.map(b => b.order),
                                     originBeat.order,
                                     destinationBeat.order,
                                     beatsAfterDestination.map(b => b.order),
                                     callbackFn);
  }

  /**
   * Given a beat, identifies which beats should be played before or after it
   * (depending on whether the beat is an originBeat or a destinationBeat)
   *
   * @param anchorBar The bar containing the selected beat
   * @param anchorBeat The selected beat
   * @param shouldReturnBeatsBefore If originBeat, return beats before. If destinationBeat, after
   * @param shouldIncludeInputBeat Whether the anchorBeat should be included in the selection
   * @param orientation The orientation of the beat list
   */
  private getAdjacentBeats(
    anchorBar: UIBarType,
    anchorBeat: UIBeatType,
    shouldReturnBeatsBefore: boolean,
    orientation: string,
  ): QueuedUIBeat[] {
    const { beats: anchorBarBeats, order: anchorBarOrder } = anchorBar;
    const anchorBeatOrder = anchorBeat.order;

    // Get the beats in the bar to the right or left
    const adjacentBarOrder = shouldReturnBeatsBefore ? anchorBarOrder - 1 : anchorBarOrder + 1;
    const adjacentBarBeats = adjacentBarOrder >= 0 && adjacentBarOrder < this.props.UIBars.length
                           ? this.props.UIBars[adjacentBarOrder].beats
                           : [];

    // Get beats in the same bar that are to the right or left
    const adjacentBeatsInBar = anchorBarBeats.filter(({ order: anchorBarBeatOrder }) => {
      if (shouldReturnBeatsBefore) {
        return anchorBarBeatOrder < anchorBeatOrder;
      }

      return anchorBarBeatOrder > anchorBeatOrder;
    });

    const adjacentBeats = [
      ...adjacentBarBeats,
      ...adjacentBeatsInBar,
    ];

    const queuedUIBeats = adjacentBeats.map((beat) => {
      return {
        ...beat,
        orientation,
      };
    });

    return queuedUIBeats.sort((a, b) => a.barOrder - b.barOrder || a.order - b.order);
  }

  /**
   * Updates which beats will eventually be played for each
   * orientation
   *
   * @param queuedUIBeats The beats that will eventually be played
   */
  private updateQueuedBeats(queuedUIBeats: QueuedUIBeat[]) {
    this.setState(({ beatLists }) => {
      const beatListsCopy = utils.deepCopy(beatLists);

      for (const orientation in beatListsCopy) {
        const queuedUIBeatsForOrientation = queuedUIBeats.filter((beat) => {
          return beat.orientation === orientation;
        });

        beatListsCopy[orientation].queued = queuedUIBeatsForOrientation;
      }

      return {
        beatLists: beatListsCopy,
      };
    });
  }

  /**
   * Updates which beat is currently playing. It starts with the first
   * queuedUIBeat, then recursively calls itself when the next beat is playing.
   *
   * @param queuedUIBeats The beats that will eventually be played
   */
  private updatePlayingBeats(queuedUIBeats: QueuedUIBeat[]) {
    const queuedUIBeatsCopy = [...queuedUIBeats];

    const updatePlayingBeat = (queuedUIBeats: QueuedUIBeat[], queuedUIBeat: QueuedUIBeat) => {
      this.setState(({ beatLists }) => {
        const beatListsCopy = utils.deepCopy(beatLists);

        for (const orientation in beatListsCopy) {
          if (orientation === queuedUIBeat.orientation) {
            beatListsCopy[orientation].playing = queuedUIBeat;
          } else {
            beatListsCopy[orientation].playing = null;
          }
        }

        let beatPreviewTimer = null;

        // When there's no queuedBeats left, we can stop recursively calling this fn
        if (queuedUIBeats.length) {
          beatPreviewTimer = setTimeout(
            () => updatePlayingBeat(queuedUIBeats, queuedUIBeats.shift()),
            queuedUIBeat.durationMs,
          );
        }

        return {
          beatPreviewTimer,
          beatLists: beatListsCopy,
        };
      });
    };

    updatePlayingBeat(queuedUIBeatsCopy, queuedUIBeatsCopy.shift());
  }

  /**
   * Retrieves the bar given the beat's barOrder
   *
   * @param beat The UI beat
   */
  private getBarFromBeat({ barOrder }: UIBeatType) {
    return this.props.UIBars[barOrder];
  }

  private getBeatListElement(orientation: Orientation): React.RefObject<BeatList> {
    if (orientation === TOP) {
      return this.topBeatListElement;
    }

    return this.bottomBeatListElement;
  }

  private getScrollableBeatListElement(orientation: Orientation): HTMLDivElement {
    const beatListElement = this.getBeatListElement(orientation).current;
    const beatsElement = beatListElement.getBeatsElement();

    return beatsElement;
  }

  private getLastFocusedScrollLeft(): number | null {
    const { beatLists, lastFocusedBeatList } = this.state;
    return lastFocusedBeatList && beatLists[lastFocusedBeatList].lastKnownScrollLeft || null;
  }
}

export default BranchNav;
