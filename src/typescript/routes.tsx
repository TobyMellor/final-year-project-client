import * as React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import CheckAuthentication from './components/CheckAuthentication/CheckAuthentication';
import CaptureAuthToken from './components/CaptureAuthToken/CaptureAuthToken';

const AppRoutes = () => (
    <Router>
        <Route path="/spotify-authorization-redirect" exact component={CaptureAuthToken} />
        <Route path="/" component={CheckAuthentication} />
    </Router>
);

export default AppRoutes;
