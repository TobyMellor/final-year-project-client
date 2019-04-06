import * as React from 'react';
import config from '../../config';
import Bar from '../bar/Bar';
import cx from 'classnames';
import { UIBarType, UIBeatType, BeatListProps, BeatListState } from '../../types/general';
import { BeatListOrientation } from '../../types/enums';

class BeatList extends React.Component<BeatListProps, BeatListState> {
  private beatsElement: React.RefObject<HTMLDivElement>;

  constructor(props: BeatListProps) {
    super(props);

    this.beatsElement = React.createRef();
    this.state = {
      selectedUIBeat: null,
      scrollCallbackFn: () => {},
    };
  }

  render() {
    const { orientation, UIBars, isHidden } = this.props;
    const barsClassNames = cx('bars', { selected: this.state.selectedUIBeat !== null });
    const scrollbarClassNames = cx(
      'horizontal-scrollbar',
      {
        'invert-scrollbar': orientation === BeatListOrientation.TOP,
        hidden: isHidden,
      },
    );

    const barElements = UIBars.map((UIBar) => {
      const {
        initiallyCenteredBeatOrder,
        queuedBeatOrders,
        playingBeatOrder,
        selectedBeatOrder,
        disabledBeatOrders,
       } = this.getImportantBeatOrders(UIBar);

      return <Bar key={UIBar.order}
                  UIBar={UIBar}
                  initiallyCenteredBeatOrder={initiallyCenteredBeatOrder}
                  queuedBeatOrders={queuedBeatOrders}
                  playingBeatOrder={playingBeatOrder}
                  selectedBeatOrder={selectedBeatOrder}
                  disabledBeatOrders={disabledBeatOrders}
                  onBeatClick={
                    (UIBeat, scrollCallbackFn) => (
                      this.handleBeatClick(UIBeat, scrollCallbackFn)
                    )
                  } />;
    });

    return (
      <div className={scrollbarClassNames}>
        <div ref={this.beatsElement}
             className={barsClassNames}
             onScroll={this.handleBeatListScroll.bind(this)}>
          {barElements}
        </div>
      </div>
    );
  }

  /**
   * An Important Beat Order for a bar is the order of a beat that is a:
   *  - Initially Centered Beat, or
   *  - Queued Beat, or
   *  - Playing Beat, or
   *  - Selected Beat, or
   *  - Disabled Beat
   *
   * If we have a list of queued beats, for example, we only want to send
   * it to the corresponding bar that it belongs to, and nothing else.
   *
   * @param UIBar The bar that we're getting the important beats for
   */
  private getImportantBeatOrders(UIBar: UIBarType): {
    initiallyCenteredBeatOrder: number,
    queuedBeatOrders: number[],
    playingBeatOrder: number,
    selectedBeatOrder: number,
    disabledBeatOrders: number[],
  } {
    const { initiallyCenteredUIBeat, queuedUIBeats, playingUIBeat, disabledUIBeats } = this.props;
    const selectedUIBeat = this.state.selectedUIBeat;

    // Get the order of a beat, if it exists and it belongs to the bar
    function getOrder(UIBeat: UIBeatType): number {
      if (!UIBeat || UIBeat.barOrder !== UIBar.order) {
        return -1;
      }

      return UIBeat.order;
    }

    // Get the orders of beats, if they belong to the bar
    function getOrders(UIBeats: UIBeatType[]): number[] {
      return UIBeats.filter(UIBeat => UIBeat.barOrder === UIBar.order)
                    .map(UIBeat => UIBeat.order);
    }

    return {
      initiallyCenteredBeatOrder: getOrder(initiallyCenteredUIBeat),
      queuedBeatOrders: getOrders(queuedUIBeats),
      playingBeatOrder: getOrder(playingUIBeat),
      selectedBeatOrder: getOrder(selectedUIBeat),
      disabledBeatOrders: getOrders(disabledUIBeats),
    };
  }

  /**
   * When clicking on a beat, update the selected beat and
   * the scrollCallbackFn.
   *
   * The scrollCallbackFn is a function that gets executed
   * every time this list is scrolled. It's used in the beat
   * component for returning to the selected beat after inactivity
   *
   * @param selectedUIBeat The clicked UIBeat
   * @param scrollCallbackFn
   */
  private handleBeatClick(selectedUIBeat: UIBeatType, scrollCallbackFn: () => void) {
    this.setState({
      selectedUIBeat,
      scrollCallbackFn,
    });

    this.props.onBeatClick(this.props.orientation,
                           selectedUIBeat);
  }

  private handleBeatListScroll({ currentTarget }: React.UIEvent) {
    const { orientation, onBeatListScroll } = this.props;
    const scrollCallbackFn = this.state.scrollCallbackFn;

    // Used in the Beat Component to return to the selected beat after inactivity
    scrollCallbackFn();

    onBeatListScroll(orientation, currentTarget);
  }
}

export default BeatList;
