import * as React from 'react';
import Nav from './Nav';
import CircleCanvas from './CircleCanvas';
import BranchNav from './branch-nav/BranchNav';
import { getUIBars } from '../services/ui/ui';
import { FYPEvent } from '../types/enums';
import Dispatcher from '../events/Dispatcher';
import { UIBarType, FYPEventPayload } from '../types/general';
import SettingsPanel from './settings-panel/SettingsPanel';

interface AppProps {}

interface AppState {
  UIBars: UIBarType[];
  isBranchNavHidden: boolean;
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

    this.state = {
      UIBars: [],
      isBranchNavHidden: true,
    };

    // When a new song has been loaded and analyzed
    Dispatcher.getInstance()
              .on(FYPEvent.PlayingTrackBranchesAnalyzed, this, this.updateBars);
  }

  render() {
    const { UIBars, isBranchNavHidden } = this.state;

    return (
      <React.Fragment>
        <Nav />
        <CircleCanvas />
        <BranchNav UIBars={UIBars}
                   isHidden={isBranchNavHidden}
                   onClose={() => this.handleToggleBranchNav()} />
        <SettingsPanel onToggleBranchNavClick={() => this.handleToggleBranchNav()}
                       isBranchNavHidden={isBranchNavHidden} />
      </React.Fragment>
    );
  }

  private handleToggleBranchNav() {
    this.setState(({ isBranchNavHidden }) => ({
      isBranchNavHidden: !isBranchNavHidden,
    }));
  }

  private async updateBars({ playingTrack }: FYPEventPayload['PlayingTrackBranchesAnalyzed']) {
    const UIBars = await getUIBars(playingTrack);

    this.setState({
      UIBars,
    });
  }
}

export default App;
