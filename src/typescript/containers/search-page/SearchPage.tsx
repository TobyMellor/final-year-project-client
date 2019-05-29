import * as React from 'react';
import { connect } from 'react-redux';
import debounce from 'lodash-es/debounce';
import { searchSpotifyTrack } from '../../actions/search-actions';
import { CombinedState } from '../../types/redux-state';

class SearchPage extends React.Component {
  constructor(props: null) {
    super(props);
    this.handleSearchChange = this.handleSearchChange.bind(this);
  }

  handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    console.log(event.target.value);
    // debounce(searchSpotifyTrack);
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

export default connect(mapStateToProps, null)(SearchPage);
