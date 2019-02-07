import * as React from 'react';
import Nav from './Nav';
import CircleCanvas from './CircleCanvas';
import BranchNav from './branch-nav/BranchNav';
import { getUIBars } from '../services/ui/entities';
import { FYPEvent } from '../types/enums';
import Dispatcher from '../events/Dispatcher';
import TrackModel from '../models/audio-analysis/Track';
import { UIBarType } from '../types/general';

interface AppProps {}

interface AppState {
  UIBars: UIBarType[];
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

    this.state = {
      UIBars: [],
    };

    // When a new song has been loaded and analyzed
    Dispatcher.getInstance()
              .on(FYPEvent.PlayingTrackBranchesAnalyzed, this, this.updateBars);
  }

  render() {
    const { UIBars } = this.state;

    return (
      <React.Fragment>
        <Nav />
        <CircleCanvas />
        <BranchNav UIBars={UIBars} />
      </React.Fragment>
    );
  }

  private async updateBars({ playingTrack }: { playingTrack: TrackModel }) {
    const UIBars = await getUIBars(playingTrack);

    this.setState({
      UIBars,
    });
  }
}

export default App;
