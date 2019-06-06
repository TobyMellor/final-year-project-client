import * as React from 'react';
import { connect } from 'react-redux';
import debounce from 'lodash-es/debounce';
import { searchSpotifyTrack, setSelectedSpotifyTrackID } from '../../actions/search-actions';
import { CombinedState } from '../../types/redux-state';
import SearchItem from '../../components/search-item/SearchItem';
import { OutputTrack } from '../../models/search-track';
import FileUploader from '../../components/file-uploader/FileUploader';
import { withRouter, RouteComponentProps } from 'react-router';
import { secsToMs } from '../../utils/conversions';

interface SearchPageProps extends RouteComponentProps {
  searchResult: OutputTrack[];
  searchSpotify: () => {};
  setSelectedTrackID: (id: string) => {};
}

type SearchPageState = {
  selectedItemID: string;
  uploadedFileDurationMs: number;
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
    this.compareDurations = this.compareDurations.bind(this);
    this.delayedSearch = debounce(this.props.searchSpotify, 1000);
    this.state = {
      selectedItemID: null,
      uploadedFileDurationMs: 0,
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

  handleClick(id: string) {
    this.setState({ selectedItemID: id });
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
    const durationMs = secsToMs(Math.ceil(durationSecs));
    this.setState({ uploadedFileDurationMs: durationMs });
    URL.revokeObjectURL(this.fileURL);
    this.compareDurations();
  }

  compareDurations() {
    const selectedItem: OutputTrack = this.props.searchResult.find(track => track.id === this.state.selectedItemID);
    if (Math.abs(parseInt(selectedItem.durationMs, 10) - this.state.uploadedFileDurationMs) <= 5000) {
      // if the selected items doesnt differ by more than 5 second
      this.props.setSelectedTrackID(this.state.selectedItemID);
      this.props.history.push('/studio');
    }
  }

  componentWillUnmount() {
    this.audioRef.current.removeEventListener('canplaythrough', this.handlePlayThrough);
  }

  render() {
    const { searchResult } = this.props;
    const { selectedItemID } = this.state;
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
                            durationMs={parseInt(track.durationMs, 10)}
                            key={track.id}
                            handleClick={this.handleClick}
                            active={track.id === selectedItemID}
                          />
                        ))
                      }
                    </div>
                    <div className="footer">
                      <FileUploader handleFileChange={this.handleFileChange} disabled={!selectedItemID} />
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
    setSelectedTrackID: (id: string) => dispatch(setSelectedSpotifyTrackID(id)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(SearchPage));
