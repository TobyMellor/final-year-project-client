import * as React from 'react';
import { Route } from 'react-router-dom';
import * as localStorage from '../../utils/localStorage';
import SearchPage from '../../containers/search-page/SearchPage';
import LoginPage from '../login-page/LoginPage';

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
        <Route path="/" exact component={SearchPage} />
      </>
    );
  }
}

export default CheckAuthentication;
