import * as React from 'react';
import Nav from './Nav';
import CircleCanvas from './CircleCanvas';
import BottomBranchNav from './BottomBranchNav';
import { UIBarType, getUIBars } from '../services/ui/entities';
import { FYPEvent } from '../types/enums';
import Dispatcher from '../events/Dispatcher';
import TrackModel from '../models/audio-analysis/Track';

interface AppProps {}

interface AppState {
  bars: UIBarType[];
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

    this.state = {
      bars: [],
    };

    // When a new song has been loaded and analyzed
    Dispatcher.getInstance()
              .on(FYPEvent.PlayingTrackBranchesAnalyzed, this, this.updateBars);
  }

  render() {
    const { bars } = this.state;

    return (
      <React.Fragment>
        <Nav />
        <CircleCanvas />
        <BottomBranchNav bars={bars} />
      </React.Fragment>
    );
  }

  private async updateBars({ playingTrack }: { playingTrack: TrackModel }) {
    const UIBars = await getUIBars(playingTrack);

    this.setState({
      bars: UIBars,
    });
  }
}

export default App;
