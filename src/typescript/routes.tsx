import * as React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import CheckAuthentication from './components/CheckAuthentication/CheckAuthentication';
import CaptureAuthToken from './components/CaptureAuthToken/CaptureAuthToken';

const AppRoutes = () => (
    <Router>
        <Switch>
            <Route path="/spotify-authorization-redirect" exact component={CaptureAuthToken} />
            <Route path="/" component={CheckAuthentication} />
        </Switch>
    </Router>
);

export default AppRoutes;
