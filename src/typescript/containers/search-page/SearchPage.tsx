import * as React from 'react';
import { connect } from 'react-redux';
import debounce from 'lodash-es/debounce';
import { searchSpotifyTrack, setSelectedSpotifyTrack } from '../../actions/search-actions';
import { CombinedState } from '../../types/redux-state';
import SearchItem from '../../components/search-item/SearchItem';
import { RemoteTrack } from '../../models/search-track';
import FileUploader from '../../components/file-uploader/FileUploader';
import { withRouter, RouteComponentProps } from 'react-router';
import * as conversions from '../../utils/conversions';
import config from '../../config';
import Translator from '../../../translations/Translator';

interface SearchPageProps extends RouteComponentProps {
  searchResult: RemoteTrack[];
  searchSpotify: () => {};
  setSelectedTrack: (ID: string, fileURL: string) => {};
}

type SearchPageState = {
  selectedTrackID: string;
};

class SearchPage extends React.Component<SearchPageProps, SearchPageState> {
  private delayedSearch: any;
  private audioRef: React.RefObject<HTMLAudioElement>;
  private fileURL: string;

  constructor(props: null) {
    super(props);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
    this.calculateAudioDuration = this.calculateAudioDuration.bind(this);
    this.handlePlayThrough = this.handlePlayThrough.bind(this);
    this.delayedSearch = debounce(this.props.searchSpotify, config.search.debounceMs);
    this.state = {
      selectedTrackID: null,
    };
    this.audioRef = React.createRef();
  }

  handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    const searchText: string = event.target.value;
    if (searchText.length) {
      event.persist();
      this.delayedSearch(event.target.value);
    }
  }

  handleClick(selectedTrackID: string) {
    this.setState({ selectedTrackID });
  }

  handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files[0];
    const audioNode = this.audioRef.current;

    this.fileURL = URL.createObjectURL(file);
    this.calculateAudioDuration();

    audioNode.setAttribute('src', this.fileURL);
  }

  calculateAudioDuration() {
    this.audioRef.current.addEventListener('canplaythrough', this.handlePlayThrough);
  }

  handlePlayThrough(event: any) {
    const durationSecs = event.currentTarget.duration;
    const localTrackDurationMs = conversions.secsToMs(Math.ceil(durationSecs));
    const selectedTrack = this.getSelectedTrack();

    this.checkDurationAndSetTrack(selectedTrack, localTrackDurationMs);
  }

  isDurationSimilar(selectedTrackDurationMs: number, localTrackDurationMs: number) {
    const durationDifferenceMs = Math.abs(selectedTrackDurationMs - localTrackDurationMs);
    return durationDifferenceMs <= config.search.minDurationSimilarityMs;
  }

  checkDurationAndSetTrack(selectedTrack: RemoteTrack, localTrackDurationMs: number) {
    const isDurationSimilar = this.isDurationSimilar(selectedTrack.durationMs, localTrackDurationMs);

    if (isDurationSimilar) {
      this.props.setSelectedTrack(selectedTrack.id, this.fileURL);
      this.props.history.push('/studio');
    } else {
      URL.revokeObjectURL(this.fileURL);
      alert(Translator.errors.ui.too_different);
    }
  }

  getSelectedTrack() {
    const selectedTrackID = this.state.selectedTrackID;
    return this.props.searchResult.find(track => track.id === selectedTrackID);
  }

  componentWillUnmount() {
    this.audioRef.current.removeEventListener('canplaythrough', this.handlePlayThrough);
  }

  render() {
    const { searchResult } = this.props;
    const { selectedTrackID } = this.state;
    return (
      <div>
        <div className="container">
          <div className="row align-items-center justify-content-center search-page">
            <div className="col col-md-8 col-lg-6 align-self-center">
              <input
                className="form-control form-control-lg"
                type="text"
                placeholder="Search Track"
                onChange={this.handleSearchChange}
              />
              {
                searchResult.length ? (
                  <div className="search-item-container">
                    <div className="search-item-list">
                      {
                        searchResult.map(track => (
                          <SearchItem
                            id={track.id}
                            name={track.name}
                            thumbnailURL={track.images[0].url}
                            durationMs={track.durationMs}
                            key={track.id}
                            handleClick={this.handleClick}
                            active={track.id === selectedTrackID}
                          />
                        ))
                      }
                    </div>
                    <div className="footer">
                      <FileUploader handleFileChange={this.handleFileChange} disabled={!selectedTrackID} />
                    </div>
                    <audio ref={this.audioRef} />
                  </div>
                ) : null
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state:CombinedState) => {
  return {
    searchResult: state.search.tracks,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    searchSpotify: (query: string) => dispatch(searchSpotifyTrack(query)),
    setSelectedTrack: (ID: string, fileURL: string) => dispatch(setSelectedSpotifyTrack(id, fileURL)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(SearchPage));
