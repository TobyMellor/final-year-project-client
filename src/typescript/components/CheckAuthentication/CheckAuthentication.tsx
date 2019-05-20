import * as React from 'react';
import { Route } from 'react-router-dom';
import localStorage from '../../utils/localStorage';
import LandingPage from '../LandingPage/LandingPage';
import LoginPage from '../LoginPage/LoginPage';

class CheckAuthentication extends React.Component {
  render() {
    const accessToken = localStorage.get('spotify_access_token');
    const refreshToken = localStorage.get('spotify_refresh_token');
    if (!accessToken || !refreshToken) {
      return (
        <LoginPage />
      );
    }
    return (
      <>
        <Route path="/" exact component={LandingPage} />
      </>
    );
  }
}

export default CheckAuthentication;
