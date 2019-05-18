import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import localStorage from '../../utils/localStorage';

class CaptureAuthToken extends React.Component<RouteComponentProps> {
  constructor(props: RouteComponentProps) {
    super(props);
    this.saveAuthToken = this.saveAuthToken.bind(this);
    this.saveAuthToken();
  }

  saveAuthToken() {
    const searchParams = new URLSearchParams(this.props.location.search);
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    localStorage.set('spotify_acess_token', accessToken);
    localStorage.set('spotify_refresh_token', refreshToken);
    if (accessToken && refreshToken) {
      this.props.history.replace('/');
    } else {
      window.location.assign(`${window.location.origin}/login`);
    }
  }

  render() {
    return (
      <React.Fragment></React.Fragment>
    );
  }
}

export default withRouter(CaptureAuthToken);