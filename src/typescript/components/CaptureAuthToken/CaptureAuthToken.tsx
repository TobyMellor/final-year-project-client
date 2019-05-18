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
    console.log(this.props);
    localStorage.set('spotify_auth_token', 'ac');
    localStorage.set('spotify_refresh_token', 'abc');
  }

  render() {
    return (
      <React.Fragment></React.Fragment>
    );
  }
}

export default withRouter(CaptureAuthToken);