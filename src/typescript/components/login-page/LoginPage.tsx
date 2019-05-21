import * as React from 'react';

const LoginPage = () => (
  <div className="container-fluid">
    <div className="row align-items-center justify-content-center login-page">
      <div className="col col-md-6 col-lg-4 align-self-center">
        <div className="card login-card">
          <div className="card-body">
            <h3 className="card-title text-center">
              Login with Spotify
            </h3>
            <div className="card-text">
              <a className="btn btn-success btn-block btn-lg login-button" href="/login">Login</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default LoginPage;
