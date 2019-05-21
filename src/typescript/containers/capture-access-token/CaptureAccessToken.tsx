import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import * as localStorage from '../../utils/localStorage';
import { saveAccessToken } from '../../actions/app-actions';
import { saveAccessTokenActionDataType } from '../../types/redux-actions';

interface CaptureAccessTokenProps extends RouteComponentProps {
  saveAccessAndRefreshToken: (data: saveAccessTokenActionDataType) => void;
}

class CaptureAccessToken extends React.Component<CaptureAccessTokenProps> {
  constructor(props: CaptureAccessTokenProps) {
    super(props);
    this.saveAuthToken = this.saveAuthToken.bind(this);
    this.saveAuthToken();
  }

  saveAuthToken() {
    const searchParams = new URLSearchParams(this.props.location.search);
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    this.props.saveAccessAndRefreshToken({ accessToken, refreshToken });
    localStorage.set('spotify_access_token', accessToken);
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

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    saveAccessAndRefreshToken: (data: saveAccessTokenActionDataType) => dispatch(saveAccessToken(data)),
  };
};

export default connect(null, mapDispatchToProps)(withRouter(CaptureAccessToken));
