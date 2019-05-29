import * as React from 'react';

class SearchPage extends React.Component {
  render() {
    return (
      <div>
        <div className="container">
          <div className="row align-items-center justify-content-center search-page">
            <div className="col col-md-8 col-lg-6 align-self-center">
              <input className="form-control form-control-lg" type="text" placeholder="Search Track" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default SearchPage;
