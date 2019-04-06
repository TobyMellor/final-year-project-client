import * as React from 'react';
import Beat from '../beat/Beat';
import cx from 'classnames';
import * as utils from '../../utils/misc';
import { UIBeatType, BarProps, BarState } from '../../types/general';

class Bar extends React.Component<BarProps, BarState> {
  constructor(props: BarProps) {
    super(props);

    const { beats } = props.UIBar;

    this.state = {
      zIndexes: Array<number>(beats.length).fill(1),
    };
  }

  shouldComponentUpdate(nextProps: BarProps, nextState: BarState) {
    return utils.shouldUpdate(
      this.props,
      nextProps,
      ['queuedBeatOrders', 'playingBeatOrder', 'selectedBeatOrder', 'disabledBeatOrders'],
      this.state,
      nextState,
      ['zIndexes'],
    );
  }

  render() {
    const {
      UIBar,
      initiallyCenteredBeatOrder,
      queuedBeatOrders,
      playingBeatOrder,
      disabledBeatOrders,
    } = this.props;
    const UIBeats = UIBar.beats;
    const zIndexes = this.state.zIndexes;

    const beatElements = UIBeats.map((UIBeat, beatOffsetInBar) => {
      const beatOrder = UIBeat.order;
      const isInitiallyCentered = this.isBeatOrderIn(beatOrder, initiallyCenteredBeatOrder);
      const isQueued = this.isBeatOrderIn(beatOrder, ...queuedBeatOrders);
      const isPlaying = this.isBeatOrderIn(beatOrder, playingBeatOrder);
      const isSelected = this.isBeatSelected(beatOrder);
      const isDisabled = this.isBeatOrderIn(beatOrder, ...disabledBeatOrders);
      const zIndex = zIndexes[beatOffsetInBar];

      return <Beat key={beatOrder}
                   UIBeat={UIBeat}
                   isInitiallyCentered={isInitiallyCentered}
                   isQueued={isQueued}
                   isPlaying={isPlaying}
                   isSelected={isSelected}
                   isDisabled={isDisabled}
                   zIndex={zIndex}
                   onBeatMouseEnter={this.handleBeatMouseEnter.bind(this, beatOffsetInBar)}
                   onBeatClick={
                      (UIBeat, scrollCallbackFn) => (
                        this.handleBeatClick(UIBeat, scrollCallbackFn)
                      )
                   } />;
    });

    const barClassNames = cx(
      'bar',
      {
        // Queued when any beat is
        queued: UIBeats.some(UIBeat => this.isBeatOrderIn(UIBeat.order, ...queuedBeatOrders)),
        selected: this.isBarSelected(),
      },
    );

    return (
      <div className={barClassNames}>
        {beatElements}
      </div>
    );
  }

  /**
   * A selected beat means that the user has clicked this beat.
   * It should be highlighted and be at the center of the beat list
   *
   * @param beatOrder The beat order within the bar
   */
  private isBeatSelected(beatOrder: number) {
    return this.isBarSelected() && this.isBeatOrderIn(beatOrder, this.props.selectedBeatOrder);
  }

  /**
   * Checks if a beat order exists in an array of beat orders
   *
   * @param beatOrder A beat order
   * @param otherBeatOrders An array of beat orders
   */
  private isBeatOrderIn(beatOrder: number, ...otherBeatOrders: number[]) {
    return otherBeatOrders.some((otherBeatOrder) => {
      return otherBeatOrder === beatOrder;
    });
  }

  /**
   * A bar is selected if any beat within is selected
   */
  private isBarSelected() {
    return this.props.selectedBeatOrder !== -1;
  }

  /**
   * When hovering over a beat, that beat should appear on top.
   * This sets the corresponding zIndex state to become the max.
   *
   * @param beatOffsetInBar The beat order within a bar
   */
  private handleBeatMouseEnter(beatOffsetInBar: number) {
    this.setState(({ zIndexes }) => {
      const copiedZIndexes = [...zIndexes];
      const highestZIndex = Math.max(...zIndexes) + 1;

      copiedZIndexes[beatOffsetInBar] = highestZIndex;

      return {
        zIndexes: copiedZIndexes,
      };
    });
  }

  private handleBeatClick(UIBeat: UIBeatType, scrollCallbackFn: () => void) {
    this.props.onBeatClick(UIBeat,
                           scrollCallbackFn);
  }
}

export default Bar;
