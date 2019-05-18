import * as React from 'react';
import { Route } from 'react-router-dom';
import LandingPage from '../LandingPage/LandingPage';

class CheckAuthentication extends React.Component {
  render() {
    return (
      <>
        <a href="/login">go to login</a>
        <Route path="/" exact component={LandingPage} />
      </>
    );
  }
}

export default CheckAuthentication;
