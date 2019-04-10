import * as React from 'react';
import Nav from './Nav';
import CircleCanvas from './CircleCanvas';
import BranchNav from './branch-nav/BranchNav';
import { getUIBars } from '../services/ui/ui';
import { FYPEvent, BranchNavStatus } from '../types/enums';
import Dispatcher from '../events/Dispatcher';
import { UIBarType, FYPEventPayload } from '../types/general';
import SettingsPanel from './settings-panel/SettingsPanel';
import config from '../config';

interface AppProps {}

interface AppState {
  UIBars: UIBarType[];
  isBranchNavHidden: boolean;
  isBranchNavDisabled: boolean;
  branchNavKey: number;
  branchNavClearTimer: NodeJS.Timeout | null;
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

    this.state = {
      UIBars: [],
      isBranchNavHidden: true,
      isBranchNavDisabled: false,
      branchNavKey: 1,
      branchNavClearTimer: null,
    };

    // When a new song has been loaded and analyzed
    Dispatcher.getInstance()
              .on(FYPEvent.TrackChanged, data => this.updateBars(data));
  }

  render() {
    const { UIBars, isBranchNavHidden, isBranchNavDisabled, branchNavKey } = this.state;

    return (
      <React.Fragment>
        <Nav />
        <CircleCanvas />
        <BranchNav key={branchNavKey}
                   UIBars={UIBars}
                   isHidden={isBranchNavHidden}
                   onRequestClose={(status: BranchNavStatus) => this.handleToggleBranchNav(status)} />
        <SettingsPanel onToggleBranchNavClick={() => this.handleToggleBranchNav()}
                       isBranchNavHidden={isBranchNavHidden}
                       isBranchNavDisabled={isBranchNavDisabled} />
      </React.Fragment>
    );
  }

  /**
   * Toggles the hidden state of the BranchNav and
   * resets the BranchNav to it's original state if the BranchNav
   * has been hidden for some amount of time
   */
  private handleToggleBranchNav(status: BranchNavStatus = null) {
    this.setState(
      ({ isBranchNavHidden }) => ({
        isBranchNavHidden: !isBranchNavHidden,
        isBranchNavDisabled: true,
      }),
      () => {
        // If the BranchNav has been hidden for some amount of time,
        // reset the BranchNav to it's original state
        const clearMs = status !== BranchNavStatus.FINISHED ? config.ui.resetBranchNavAfterHiddenMs : 0;
        const branchNavClearTimer = setTimeout(() => {
          if (this.state.isBranchNavHidden) {
            this.setState(({ branchNavKey }) => ({
              branchNavKey: branchNavKey + 1,
            }));
          }
        }, clearMs);

        setTimeout(() => {
          this.setState({ isBranchNavDisabled: false });
        }, config.ui.scrollToDurationMs);

        // Replace any existing timer
        clearTimeout(this.state.branchNavClearTimer);
        this.setState({ branchNavClearTimer });
      },
    );
  }

  private updateBars({ track }: FYPEventPayload['TrackChanged']) {
    const UIBars = getUIBars(track);

    this.setState({
      UIBars,
    });
  }
}

export default App;
