import * as React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import CheckAuthentication from './components/CheckAuthentication/CheckAuthentication';
import CaptureAccessToken from './components/CaptureAccessToken/CaptureAccessToken';

const AppRoutes = () => (
    <Router>
        <Switch>
            <Route path="/spotify-authorization-redirect" exact component={CaptureAccessToken} />
            <Route path="/" component={CheckAuthentication} />
        </Switch>
    </Router>
);

export default AppRoutes;
