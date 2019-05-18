import * as React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import CheckAuthentication from './components/CheckAuthentication/CheckAuthentication';
import LoginPage from './components/LoginPage/LoginPage';
import CaptureAuthToken from './components/CaptureAuthToken/CaptureAuthToken';

const AppRoutes = () => (
    <Router>
        <Route path="/login" exact component={LoginPage} />
        <Route path="/spotify-authorization-redirect" exact component={CaptureAuthToken} />
        <Route path="/" component={CheckAuthentication} />
    </Router>
);

export default AppRoutes;
