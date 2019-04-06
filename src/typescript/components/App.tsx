import * as React from 'react';
import Nav from './Nav';
import CircleCanvas from './CircleCanvas';
import BranchNav from './branch-nav/BranchNav';
import { getUIBars } from '../services/ui/ui';
import { FYPEvent } from '../types/enums';
import Dispatcher from '../events/Dispatcher';
import { UIBarType, FYPEventPayload } from '../types/general';
import SettingsPanel from './settings-panel/SettingsPanel';
import config from '../config';

interface AppProps {}

interface AppState {
  UIBars: UIBarType[];
  isBranchNavHidden: boolean;
  branchNavKey: number;
  branchNavClearTimer: NodeJS.Timeout | null;
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

    this.state = {
      UIBars: [],
      isBranchNavHidden: true,
      branchNavKey: 1,
      branchNavClearTimer: null,
    };

    // When a new song has been loaded and analyzed
    Dispatcher.getInstance()
              .on(FYPEvent.PlayingTrackBranchesAnalyzed, this, this.updateBars);
  }

  render() {
    const { UIBars, isBranchNavHidden, branchNavKey } = this.state;

    return (
      <React.Fragment>
        <Nav />
        <CircleCanvas />
        <BranchNav key={branchNavKey}
                   UIBars={UIBars}
                   isHidden={isBranchNavHidden}
                   onClose={() => this.handleToggleBranchNav()}
                   playthroughPercent={0} />
        <SettingsPanel onToggleBranchNavClick={() => this.handleToggleBranchNav()}
                       isBranchNavHidden={isBranchNavHidden} />
      </React.Fragment>
    );
  }

  /**
   * Toggles the hidden state of the BranchNav and
   * resets the BranchNav to it's original state if the BranchNav
   * has been hidden for some amount of time
   */
  private handleToggleBranchNav() {
    this.setState(
      ({ isBranchNavHidden }) => ({
        isBranchNavHidden: !isBranchNavHidden,
      }),
      () => {
        // If the BranchNav has been hidden for some amount of time,
        // reset the BranchNav to it's original state
        const branchNavClearTimer = setTimeout(() => {
          if (this.state.isBranchNavHidden) {
            this.setState(({ branchNavKey }) => ({
              branchNavKey: branchNavKey + 1,
            }));
          }
        }, config.ui.resetBranchNavAfterHiddenMs);

        // Replace any existing timer
        clearTimeout(this.state.branchNavClearTimer);
        this.setState({ branchNavClearTimer });
      },
    );
  }

  private async updateBars({ playingTrack }: FYPEventPayload['PlayingTrackBranchesAnalyzed']) {
    const UIBars = await getUIBars(playingTrack);

    this.setState({
      UIBars,
    });
  }
}

export default App;
