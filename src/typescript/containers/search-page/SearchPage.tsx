import * as React from 'react';
import { connect } from 'react-redux';
import debounce from 'lodash-es/debounce';
import { searchSpotifyTrack } from '../../actions/search-actions';
import { CombinedState } from '../../types/redux-state';
import SearchItem from '../../components/search-item/SearchItem';
import { OutputTrack } from '../../models/search-track';
import FileUploader from '../../components/file-uploader/FileUploader';

type SearchPageProps = {
  searchResult: OutputTrack[];
  searchSpotify: () => {};
};

type SearchPageState = {
  selectedItemID: string;
}

class SearchPage extends React.Component<SearchPageProps, SearchPageState> {
  private delayedSearch: any;
  constructor(props: null) {
    super(props);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
    this.delayedSearch = debounce(this.props.searchSpotify, 1000);
    this.state = {
      selectedItemID: null,
    };
  }

  handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    const searchText:string = event.target.value;
    if (searchText.length) {
      event.persist();
      this.delayedSearch(event.target.value);
    }
  }

  handleClick(id: string) {
    this.setState({ selectedItemID: id });
  }

  handleFileChange() {

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
                            thumbnail={track.images[0].url}
                            duration={track.duration}
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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchPage);
