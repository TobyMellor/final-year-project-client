import * as React from 'react';
import Nav from '../Nav';
import CircleCanvas from '../CircleCanvas';
import BranchNav from '../branch-nav/BranchNav';
import * as uiService from '../../services/ui/ui';
import * as trackFactory from '../../factories/track';
import { FYPEvent, BranchNavStatus } from '../../types/enums';
import Dispatcher from '../../events/Dispatcher';
import { UIBarType, FYPEventPayload, OptionsPanelProps } from '../../types/general';
import OptionsPanel from '../options-panel/OptionsPanel';
import config from '../../config';
import SongTransitionModel from '../../models/SongTransition';
import TrackModel from '../../models/audio-analysis/Track';
import { connect } from 'react-redux';
import { CombinedState } from '../../types/redux-state';

interface LandingPageProps {
  spotifyTrackID: string;
  spotifyTrackFileURL: string;
}

interface LandingPageState {
  UIBars: UIBarType[];
  isBranchNavHidden: boolean;
  isBranchNavDisabled: boolean;
  hasRequestedTrackChange: boolean;
  branchNavKey: number;
  branchNavClearTimer: NodeJS.Timeout | null;
  childTracks: {
    ID: string,
    text: string,
  }[];
}

class LandingPage extends React.Component<LandingPageProps, LandingPageState> {
  constructor(props: LandingPageProps) {
    super(props);

    this.state = {
      UIBars: [],
      isBranchNavHidden: true,
      isBranchNavDisabled: false,
      hasRequestedTrackChange: false,
      branchNavKey: 1,
      branchNavClearTimer: null,
      childTracks: [],
    };

    // When a new song has been loaded and analyzed
    Dispatcher.getInstance()
      .on(FYPEvent.TrackChanged, ({ track }: FYPEventPayload['TrackChanged']) => {
        this.updateBars(track);
      });

    if (config.fyp.debug) {
      Dispatcher.getInstance()
        .on(FYPEvent.TransitionsAnalyzed, ({ transitions }: FYPEventPayload['TransitionsAnalyzed']) => {
          this.setChildTracks(transitions);
        });
    }
  }

  componentDidMount() {
    const { spotifyTrackID, spotifyTrackFileURL } = this.props;

    trackFactory.createTrack(spotifyTrackID)
      .then((initialTrack: TrackModel) => {
        Dispatcher.getInstance()
          .dispatch(FYPEvent.TrackChangeRequested, {
            fileURL: spotifyTrackFileURL,
            track: initialTrack,
          } as FYPEventPayload['TrackChangeRequested']);
      });
  }

  render() {
    const { UIBars, isBranchNavHidden, branchNavKey } = this.state;
    const debugPanel = config.fyp.debug && <OptionsPanel {...this.getDebugPanelProps()} />;

    return (
      <React.Fragment>
        <Nav />
        <CircleCanvas />
        <BranchNav key={branchNavKey}
          UIBars={UIBars}
          isHidden={isBranchNavHidden}
          onRequestClose={(status: BranchNavStatus) => this.handleToggleBranchNav(status)} />
        {debugPanel}
        <OptionsPanel {...this.getOptionsPanelProps()} />
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
            this.resetBranchNav();
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

  private updateBars(track: TrackModel) {
    const UIBars = uiService.getUIBars(track);

    this.setState({
      UIBars,
    });
    this.resetBranchNav();
  }

  private resetBranchNav() {
    this.setState(({ branchNavKey }) => ({
      branchNavKey: branchNavKey + 1,
    }));
  }

  private getOptionsPanelProps(): OptionsPanelProps {
    const { isBranchNavHidden, isBranchNavDisabled } = this.state;
    const toggleBranchNavButton = {
      label: isBranchNavHidden ? 'Add Branch' : 'Hide Branch Creator',
      disabled: isBranchNavDisabled,
      onClick: () => this.handleToggleBranchNav(),
    };

    return {
      toggles: {
        buttons: [
          toggleBranchNavButton,
        ],
        dropdowns: [],
        sliders: [],
      },
    };
  }

  private getDebugPanelProps(): OptionsPanelProps {
    const { hasRequestedTrackChange, childTracks } = this.state;
    const requestTrackChangeDropdown = {
      label: 'Request Track Change',
      disabled: hasRequestedTrackChange,
      options: childTracks,
      onClick: (ID: string) => this.handleRequestTrackChange(ID),
    };
    const changeTransitionProbabilitySlider = {
      label: 'Change Transition Probability',
      min: 0,
      max: 1,
      step: 0.01,
      initialValue: config.choosing.minimumTransitionProbability,
      onSlide: (value: number) => (config.choosing.minimumTransitionProbability = value),
    };

    return {
      isDebugPanel: true,
      toggles: {
        buttons: [],
        dropdowns: [
          requestTrackChangeDropdown,
        ],
        sliders: [
          changeTransitionProbabilitySlider,
        ],
      },
    };
  }

  private setChildTracks(transitions: SongTransitionModel[]) {
    const childTracks = transitions.map(({ destinationTrack }) => {
      return {
        ID: destinationTrack.ID,
        text: destinationTrack.name,
      };
    });

    this.setState({ childTracks });
  }

  private handleRequestTrackChange(ID: string) {
    console.log(`ID: ${ID}`);
  }
}

const mapStateToProps = (state: CombinedState) => {
  return {
    spotifyTrackID: state.search.selectedSpotifyTrackID,
    spotifyTrackFileURL: state.search.selectedSpotifyTrackFileURL,
  };
};

export default connect(mapStateToProps, null)(LandingPage);
