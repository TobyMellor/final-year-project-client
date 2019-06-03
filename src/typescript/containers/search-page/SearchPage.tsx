import * as React from 'react';
import { connect } from 'react-redux';
import debounce from 'lodash-es/debounce';
import { searchSpotifyTrack } from '../../actions/search-actions';
import { CombinedState } from '../../types/redux-state';

type SearchPageProps = {
  searchSpotify: () => {};
};

class SearchPage extends React.Component<SearchPageProps> {
  private delayedSearch: any;
  constructor(props: null) {
    super(props);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.delayedSearch = debounce(this.props.searchSpotify, 1000);
  }

  handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    const searchText:string = event.target.value;
    event.persist();
    this.delayedSearch(event.target.value);
  }

  render() {
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
