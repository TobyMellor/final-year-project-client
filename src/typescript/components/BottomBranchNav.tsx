import * as React from 'react';
import BeatList from './BeatList';
import Translator from '../../translations/Translator';
import cx from 'classnames';
import Button, { SuccessButton } from './Button';
import { UIBarType, UIBeatType } from '../services/ui/entities';
import WebAudioService from '../services/web-audio/WebAudioService';
import CanvasService from '../services/canvas/CanvasService';

interface BottomBranchNavProps {
  UIBars: UIBarType[];
}

export enum BeatListOrientation {
  TOP = 'top',
  BOTTOM = 'bottom',
}

interface BottomBranchNavState {
  status: BottomBranchNavStatus;
  UIBarsAndBeats: {
    [key: string]: { // Key is an orientation in BeatListOrientation
      queued?: UIBeatType[],
      playing?: UIBeatType,
      selected?: UIBeatType,
      disabled?: UIBeatType[],
    },
  };
  beatPreviewTimer: NodeJS.Timeout;
  lastFocusedBeatList: BeatListOrientation | null;
  isScrollingLocked: boolean;
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
      UIBarsAndBeats: {
        [BeatListOrientation.TOP]: {},
        [BeatListOrientation.BOTTOM]: {},
      },
      beatPreviewTimer: null,
      lastFocusedBeatList: null,
      isScrollingLocked: false,
    };
  }

  render() {
    const { UIBars } = this.props;
    const { status, UIBarsAndBeats } = this.state;
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
                          queuedUIBeats={UIBarsAndBeats[BeatListOrientation.TOP].queued}
                          playingUIBeat={UIBarsAndBeats[BeatListOrientation.TOP].playing}
                          disabledUIBeats={UIBarsAndBeats[BeatListOrientation.TOP].disabled}
                          orientation={BeatListOrientation.TOP} />
                <BeatList parentComponent={this}
                          signalClickToParentFn={this.handleBeatListClick}
                          signalScrollToParentFn={this.handleScroll}
                          UIBars={UIBars}
                          queuedUIBeats={UIBarsAndBeats[BeatListOrientation.BOTTOM].queued}
                          playingUIBeat={UIBarsAndBeats[BeatListOrientation.BOTTOM].playing}
                          disabledUIBeats={UIBarsAndBeats[BeatListOrientation.BOTTOM].disabled}
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
    thisComponent.setState(({ UIBarsAndBeats }) => {
      const isOrientationTop = beatListOrientation === BeatListOrientation.TOP;

      if (isOrientationTop) {
        UIBarsAndBeats[BeatListOrientation.TOP].selected = selectedUIBeat;
        UIBarsAndBeats[BeatListOrientation.BOTTOM].disabled = [selectedUIBeat];
      } else {
        UIBarsAndBeats[BeatListOrientation.BOTTOM].selected = selectedUIBeat;
        UIBarsAndBeats[BeatListOrientation.TOP].disabled = [selectedUIBeat];
      }

      return {
        UIBarsAndBeats,
      };
    });

    const { status } = thisComponent.state;

    if (status === BottomBranchNavStatus.CHOOSE_FIRST_BEAT) {
      thisComponent.setState({
        status: BottomBranchNavStatus.CHOOSE_SECOND_BEAT,
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

    const { UIBarsAndBeats } = this.state;
    const topSelectedBeat = UIBarsAndBeats[BeatListOrientation.TOP].selected;
    const bottomSelectedBeat = UIBarsAndBeats[BeatListOrientation.BOTTOM].selected;
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
    this.setState(({ beatPreviewTimer, UIBarsAndBeats }) => {
      clearTimeout(beatPreviewTimer);

      for (const orientation in UIBarsAndBeats) {
        delete UIBarsAndBeats[orientation].playing;
        delete UIBarsAndBeats[orientation].queued;
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
    currentTarget: Element,
  ) {
    function scrollTo(left: number) {
      // Scroll the scrollTracker smoothly to the new position
      scrollTrackerContainerElement.scrollTo({
        left,
        behavior: 'smooth',
      });
    }

    const { lastFocusedBeatList, isScrollingLocked } = thisComponent.state;
    const scrollTrackerElement = thisComponent.scrollTrackerElement.current;
    const scrollTrackerContainerElement = thisComponent.scrollTrackerContainerElement.current;

    if (!lastFocusedBeatList) {
      scrollTrackerElement.style.width = `${currentTarget.scrollWidth}px`;
    }

    if (!isScrollingLocked) {
      // The focused beat list has changed, set the state for next time
      if (!lastFocusedBeatList || lastFocusedBeatList !== beatListOrientation) {
        thisComponent.setState({
          lastFocusedBeatList: beatListOrientation,
        });
      }

      // Keep the scroll tracker in sync with the beat list
      if (!lastFocusedBeatList || lastFocusedBeatList === beatListOrientation) {
        scrollTrackerContainerElement.scrollLeft = currentTarget.scrollLeft;
      } else {

        // Lock the scrolling
        thisComponent.setState(() => {
          return {
            isScrollingLocked: true,
          };
        });
      }
    } else {
      scrollTo(currentTarget.scrollLeft);
    }
  }

  private handleScrollTracker() {
    function getScrollPercentage({ scrollLeft, scrollWidth, clientWidth }: Element) {
      const totalScrollWidth = scrollWidth - clientWidth;
      const scrollDecimal = scrollLeft / totalScrollWidth;
      const scrollPercentage = 100 * scrollDecimal;

      return scrollPercentage;
    }

    const scrollTrackerContainerElement = this.scrollTrackerContainerElement.current;
    const scrollPercentage = getScrollPercentage(scrollTrackerContainerElement);

    CanvasService.getInstance()
                 .updateCanvasRotation(scrollPercentage);
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

    setTimeout(
      () => {
        this.updatePlayingBeats(queuedUIBeats);
        this.updateQueuedBeats(queuedUIBeats);
      },
      queuedUIBeats[0].durationMs);

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
    this.setState(({ UIBarsAndBeats }) => {
      for (const orientation in UIBarsAndBeats) {
        const queuedUIBeatsForOrientation = queuedUIBeats.filter((beat) => {
          return beat.orientation === orientation;
        });

        UIBarsAndBeats[orientation].queued = queuedUIBeatsForOrientation;
      }

      return {
        UIBarsAndBeats,
      };
    });
  }

  private updatePlayingBeats(queuedUIBeats: QueuedUIBeat[]) {
    const copyQueuedUIBeats = [...queuedUIBeats];

    const updatePlayingBeat = (queuedUIBeats: QueuedUIBeat[], queuedUIBeat: QueuedUIBeat) => {
      this.setState(({ UIBarsAndBeats }) => {
        for (const orientation in UIBarsAndBeats) {
          if (orientation === queuedUIBeat.orientation) {
            UIBarsAndBeats[orientation].playing = queuedUIBeat;
          } else {
            delete UIBarsAndBeats[orientation].playing;
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
          UIBarsAndBeats,
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
