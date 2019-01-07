import * as React from 'react';
import BeatList from './BeatList';
import Translator from '../../translations/Translator';
import cx from 'classnames';
import Button, { SuccessButton } from './Button';
import { UIBarType, UIBeatType } from '../services/ui/entities';
import WebAudioService from '../services/web-audio/WebAudioService';
import CanvasService from '../services/canvas/CanvasService';
import { areArraysEqual } from '../services/canvas/drawables/utils/conversions';

interface BottomBranchNavProps {
  UIBars: UIBarType[];
}

export enum BeatListOrientation {
  TOP = 'top',
  BOTTOM = 'bottom',
}

interface BottomBranchNavState {
  status: BottomBranchNavStatus;
  beatLists: {
    [key: string]: { // Key is an orientation in BeatListOrientation
      queued: UIBeatType[],
      playing?: UIBeatType,
      selected?: UIBeatType,
      disabled: UIBeatType[],
      lastKnownScrollPosition?: number,
    },
  };
  beatPreviewTimer: NodeJS.Timeout;
  lastFocusedBeatList: BeatListOrientation | null;
  scrollLeftTarget: number;
  scrollPriorityBeatList: BeatListOrientation | null;
}

class BottomBranchNav extends React.Component<BottomBranchNavProps, BottomBranchNavState> {
  private scrollTrackerContainerElement: React.RefObject<HTMLDivElement>;
  private scrollTrackerElement: React.RefObject<HTMLDivElement>;

  constructor(props: BottomBranchNavProps) {
    super(props);

    this.scrollTrackerElement = React.createRef();
    this.scrollTrackerContainerElement = React.createRef();
    this.state = {
      status: BottomBranchNavStatus.CHOOSE_FIRST_BEAT,
      beatLists: {
        [BeatListOrientation.TOP]: {
          queued: [],
          disabled: [],
        },
        [BeatListOrientation.BOTTOM]: {
          queued: [],
          disabled: [],
        },
      },
      beatPreviewTimer: null,
      lastFocusedBeatList: null,
      scrollLeftTarget: -1,
      scrollPriorityBeatList: null,
    };
  }

  shouldComponentUpdate(nextProps: BottomBranchNavProps, nextState: BottomBranchNavState) {
    const { status, beatLists } = this.state;
    const { status: nextStatus, beatLists: nextBeatLists } = nextState;
    const { UIBars } = this.props;
    const { UIBars: nextUIBars } = nextProps;

    if (UIBars.length !== nextUIBars.length) {
      return true;
    }

    if (status !== nextStatus) {
      return true;
    }

    for (const orientation in beatLists) {
      const beatList = beatLists[orientation];
      const nextBeatList = nextBeatLists[orientation];
      const hasChanged = !areArraysEqual(beatList.queued, nextBeatList.queued) ||
                         beatList.playing !== nextBeatList.playing ||
                         beatList.selected !== nextBeatList.selected ||
                         !areArraysEqual(beatList.disabled, nextBeatList.disabled);

      // For performance, don't re-render the list if only the lastKnownScrollPosition has changed
      if (hasChanged) {
        return true;
      }
    }

    return false;
  }

  render() {
    const { UIBars } = this.props;
    const { status, beatLists } = this.state;
    const instructionForStatus = this.getInstructionForStatus();
    const modalFooterElement = this.getFooter();
    const bottomBranchNavBodyClassNames = cx(
      'bottom-branch-nav-body',
      {
        previewable: status === BottomBranchNavStatus.PREVIEWABLE,
        previewing: status === BottomBranchNavStatus.PREVIEWING,
      },
    );

    return (
      <div className="modal fade show"
           tabIndex={-1}
           role="dialog"
           style={ { display: 'block' } }>
        <div className="modal-dialog bottom-branch-nav" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Create a Branch</h5>
              <h3 className="modal-title-feedback">{instructionForStatus}</h3>
              <button type="button" className="close" data-dismiss="modal">
                <span>&times;</span>
              </button>
            </div>
            <div className="modal-body p-0">
              <div className={bottomBranchNavBodyClassNames}>
                <BeatList parentComponent={this}
                          signalClickToParentFn={this.handleBeatListClick}
                          signalScrollToParentFn={this.handleScroll}
                          UIBars={UIBars}
                          queuedUIBeats={beatLists[BeatListOrientation.TOP].queued}
                          playingUIBeat={beatLists[BeatListOrientation.TOP].playing}
                          disabledUIBeats={beatLists[BeatListOrientation.TOP].disabled}
                          orientation={BeatListOrientation.TOP} />
                <BeatList parentComponent={this}
                          signalClickToParentFn={this.handleBeatListClick}
                          signalScrollToParentFn={this.handleScroll}
                          UIBars={UIBars}
                          queuedUIBeats={beatLists[BeatListOrientation.BOTTOM].queued}
                          playingUIBeat={beatLists[BeatListOrientation.BOTTOM].playing}
                          disabledUIBeats={beatLists[BeatListOrientation.BOTTOM].disabled}
                          isHidden={status === BottomBranchNavStatus.CHOOSE_FIRST_BEAT}
                          orientation={BeatListOrientation.BOTTOM}  />
              </div>
              <div ref={this.scrollTrackerContainerElement}
                   style={ { overflowX: 'scroll' } }
                   onScroll={this.handleScrollTracker.bind(this)}>
                <div ref={this.scrollTrackerElement}>...</div>
              </div>
            </div>
            {modalFooterElement}
          </div>
        </div>
      </div>
    );
  }

  private shouldShowFooter(): boolean {
    const { status } = this.state;

    return status !== BottomBranchNavStatus.CHOOSE_FIRST_BEAT
        && status !== BottomBranchNavStatus.CHOOSE_SECOND_BEAT;
  }

  private getFooter(): JSX.Element {
    const shouldShowFooter = this.shouldShowFooter();

    if (!shouldShowFooter) {
      return <div className="modal-footer modal-footer-collapsed"></div>;
    }

    const { status } = this.state;
    const isPreviewing = status === BottomBranchNavStatus.PREVIEWING;

    return (
      <div className="modal-footer">
        <SuccessButton key="preview"
                       label="Preview"
                       onClickFn={this.handlePreviewClick.bind(this)}
                       shouldHide={isPreviewing}
                       shouldFadeIn={true} />
        <Button key="previewing_back"
                label="Back"
                onClickFn={this.handlePreviewingBackClick.bind(this)}
                shouldHide={!isPreviewing} />
        <SuccessButton key="previewing_create_branch"
                       label="Create Branch"
                       onClickFn={this.handleCreateBranchClick.bind(this)}
                       shouldHide={!isPreviewing} />
      </div>
    );
  }

  private handleBeatListClick(
    thisComponent: BottomBranchNav,
    beatListOrientation: BeatListOrientation,
    selectedUIBeat: UIBeatType,
  ) {
    thisComponent.setState(({ beatLists }) => {
      const isOrientationTop = beatListOrientation === BeatListOrientation.TOP;

      if (isOrientationTop) {
        beatLists[BeatListOrientation.TOP].selected = selectedUIBeat;
        beatLists[BeatListOrientation.BOTTOM].disabled = [selectedUIBeat];
      } else {
        beatLists[BeatListOrientation.BOTTOM].selected = selectedUIBeat;
        beatLists[BeatListOrientation.TOP].disabled = [selectedUIBeat];
      }

      return {
        beatLists,
      };
    });

    const { status } = thisComponent.state;

    if (status === BottomBranchNavStatus.CHOOSE_FIRST_BEAT) {
      thisComponent.setState({
        scrollPriorityBeatList: beatListOrientation,
        status: BottomBranchNavStatus.CHOOSE_SECOND_BEAT,
      }, () => {

        // For smoothness, only allow the bottom beat list to scroll for 1s
        setTimeout(() => {
          thisComponent.setState({ scrollPriorityBeatList: null });
        }, 1000);
      });
    } else if (status === BottomBranchNavStatus.CHOOSE_SECOND_BEAT) {
      thisComponent.setState({
        status: BottomBranchNavStatus.PREVIEWABLE,
      });
    }
  }

  private handlePreviewClick() {
    this.setState(({ beatPreviewTimer }) => {
      clearTimeout(beatPreviewTimer);

      return {
        status: BottomBranchNavStatus.PREVIEWING,
        beatPreviewTimer: null,
      };
    });

    const { beatLists } = this.state;
    const topSelectedBeat = beatLists[BeatListOrientation.TOP].selected;
    const bottomSelectedBeat = beatLists[BeatListOrientation.BOTTOM].selected;
    const topSelectedBar = this.getBarFromBeat(topSelectedBeat);
    const bottomSelectedBar = this.getBarFromBeat(bottomSelectedBeat);

    this.playBeatPaths(topSelectedBar,
                       bottomSelectedBar,
                       topSelectedBeat,
                       bottomSelectedBeat,
                       BeatListOrientation.TOP,
                       BeatListOrientation.BOTTOM);
  }

  private handlePreviewingBackClick() {
    this.setState(({ beatPreviewTimer, beatLists }) => {
      clearTimeout(beatPreviewTimer);

      for (const orientation in beatLists) {
        delete beatLists[orientation].playing;
        delete beatLists[orientation].queued;
      }

      return {
        status: BottomBranchNavStatus.PREVIEWABLE,
        beatPreviewTimer: null,
      };
    });

    WebAudioService.getInstance()
                   .stop();
  }

  private handleCreateBranchClick() {
    console.log('Our work here is done!');
  }

  private handleScroll(
    thisComponent: BottomBranchNav,
    beatListOrientation: BeatListOrientation,
    { scrollLeft: newScrollLeftTarget, scrollWidth }: Element,
  ) {
    const { lastFocusedBeatList, scrollLeftTarget, scrollPriorityBeatList } = thisComponent.state;
    const scrollTrackerContainerElement = thisComponent.scrollTrackerContainerElement.current;

    if (scrollPriorityBeatList && scrollPriorityBeatList !== beatListOrientation) {
      return;
    }

    // Update the lastKnownScrollPosition and lastFocusedBeatList
    thisComponent.setState(({ beatLists }) => {
      beatLists[beatListOrientation].lastKnownScrollPosition = newScrollLeftTarget;

      return {
        beatLists,
        lastFocusedBeatList: beatListOrientation,
      };
    });

    // If it's the first time we're in this function, initialize the scrollTracker
    // by giving it the same width as the beat lists
    if (!lastFocusedBeatList) {
      const scrollTrackerElement = thisComponent.scrollTrackerElement.current;

      scrollTrackerElement.style.width = `${scrollWidth}px`;
    }

    if (scrollLeftTarget === -1) {
      if (!lastFocusedBeatList || lastFocusedBeatList === beatListOrientation) {
        // Keep the scroll tracker in sync with the beat list
        scrollTrackerContainerElement.scrollLeft = newScrollLeftTarget;
      } else {

        // The focused beat list has changed, set the state for next time
        thisComponent.smoothlyCatchUpScrollTracker.bind(thisComponent, newScrollLeftTarget)();
      }
    }
  }

  private smoothlyCatchUpScrollTracker(newScrollLeftTarget: number) {
    const scrollTrackerContainerElement = this.scrollTrackerContainerElement.current;

    // Scroll the scrollTracker smoothly to the new position if a new target is set
    this.setState({
      scrollLeftTarget: newScrollLeftTarget,
    }, () => {
      if (newScrollLeftTarget !== -1) {
        scrollTrackerContainerElement.scrollTo({
          left: newScrollLeftTarget,
          behavior: 'smooth',
        });
      }
    });
  }

  private handleScrollTracker() {
    const { scrollLeftTarget, beatLists, lastFocusedBeatList } = this.state;
    const { scrollLeft, scrollWidth, clientWidth } = this.scrollTrackerContainerElement.current;

    const isCaughtUpToTarget = this.isScrollTrackerCaughtUp(scrollLeft, scrollLeftTarget);

    // Check if we've caught up to the last scrollLeft target that was set
    if (isCaughtUpToTarget) {
      const newScrollLeftTarget = beatLists[lastFocusedBeatList].lastKnownScrollPosition;
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

    const scrollPercentage = this.getScrollPercentage(scrollLeft, scrollWidth, clientWidth);

    CanvasService.getInstance()
                 .updateCanvasRotation(scrollPercentage);
  }

  private getScrollPercentage(
    scrollLeft: number,
    scrollWidth: number,
    clientWidth: number,
  ): number {
    const totalScrollWidth = scrollWidth - clientWidth;
    const scrollDecimal = scrollLeft / totalScrollWidth;
    const scrollPercentage = 100 * scrollDecimal;

    return scrollPercentage;
  }

  private isScrollTrackerCaughtUp(scrollLeft: number, scrollLeftTarget: number): boolean {
    const THRESHOLD = 1000;

    return Math.abs(scrollLeft - scrollLeftTarget) <= THRESHOLD;
  }

  private getInstructionForStatus(): string {
    const status = this.state.status;
    const instruction = Translator.react.bottom_branch_nav[status];

    return instruction;
  }

  private playBeatPaths(
    originBar: UIBarType,
    destinationBar: UIBarType,
    originBeat: UIBeatType,
    destinationBeat: UIBeatType,
    startOrientation: BeatListOrientation,
    endOrientation: BeatListOrientation,
  ) {
    const queuedUIBeats = [
      ...this.getAdjacentBeats(originBar,
                               originBeat,
                               true,
                               true,
                               startOrientation as any),
      ...this.getAdjacentBeats(destinationBar,
                               destinationBeat,
                               false,
                               false,
                               endOrientation as any),
    ];
    const queuedUIBeatOrders = queuedUIBeats.map(beat => beat.order);

    setTimeout(() => {
      this.updatePlayingBeats(queuedUIBeats);
      this.updateQueuedBeats(queuedUIBeats);
    }, queuedUIBeats[0].durationMs);

    // Play the opposite branch
    const callbackFn = () => {
      const { status } = this.state;

      // If we're still previewing when the beats have finished
      if (status === BottomBranchNavStatus.PREVIEWING) {

        // Reverse the originBeat and destinationBeat
        this.playBeatPaths(destinationBar,
                           originBar,
                           destinationBeat,
                           originBeat,
                           endOrientation,
                           startOrientation);
      }
    };

    WebAudioService.getInstance()
                   .previewBeatsWithOrders(queuedUIBeatOrders,
                                           callbackFn.bind(this));
  }

  private getAdjacentBeats(
    anchorBar: UIBarType,
    anchorBeat: UIBeatType,
    shouldReturnBeatsBefore: boolean,
    shouldIncludeInputBeat: boolean,
    orientation: string,
  ): QueuedUIBeat[] {
    const { beats: anchorBarBeats, order: anchorBarOrder } = anchorBar;
    const anchorBeatOrder = anchorBeat.order;

    // Get the beats in the bar to the right or left
    const adjacentBarOrder = shouldReturnBeatsBefore ? anchorBarOrder - 1 : anchorBarOrder + 1;
    const adjacentBarBeats = this.props.UIBars[adjacentBarOrder].beats;

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

    if (shouldIncludeInputBeat) {
      adjacentBeats.push(anchorBeat);
    }

    const queuedUIBeats = adjacentBeats.map((beat) => {
      return {
        ...beat,
        orientation,
      };
    });

    return queuedUIBeats.sort((a, b) => a.order - b.order);
  }

  private updateQueuedBeats(queuedUIBeats: QueuedUIBeat[]) {
    this.setState(({ beatLists }) => {
      for (const orientation in beatLists) {
        const queuedUIBeatsForOrientation = queuedUIBeats.filter((beat) => {
          return beat.orientation === orientation;
        });

        beatLists[orientation].queued = queuedUIBeatsForOrientation;
      }

      return {
        beatLists,
      };
    });
  }

  private updatePlayingBeats(queuedUIBeats: QueuedUIBeat[]) {
    const copyQueuedUIBeats = [...queuedUIBeats];

    const updatePlayingBeat = (queuedUIBeats: QueuedUIBeat[], queuedUIBeat: QueuedUIBeat) => {
      this.setState(({ beatLists }) => {
        for (const orientation in beatLists) {
          if (orientation === queuedUIBeat.orientation) {
            beatLists[orientation].playing = queuedUIBeat;
          } else {
            delete beatLists[orientation].playing;
          }
        }

        let beatPreviewTimer = null;

        if (queuedUIBeats.length) {
          beatPreviewTimer = setTimeout(
            () => updatePlayingBeat(queuedUIBeats, queuedUIBeats.shift()),
            queuedUIBeat.durationMs,
          );
        }

        return {
          beatLists,
          beatPreviewTimer,
        };
      });
    };

    updatePlayingBeat(copyQueuedUIBeats, copyQueuedUIBeats.shift());
  }

  private getBarFromBeat({ barOrder }: UIBeatType) {
    const { UIBars } = this.props;

    return UIBars[barOrder];
  }
}

export enum BottomBranchNavStatus {
  CHOOSE_FIRST_BEAT = 'choose_first_beat',
  CHOOSE_SECOND_BEAT = 'choose_second_beat',
  PREVIEWABLE = 'previewable',
  PREVIEWING = 'previewing',
}

interface QueuedUIBeat extends UIBeatType {
  orientation: string;
}

export default BottomBranchNav;
