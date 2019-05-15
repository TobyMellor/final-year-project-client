import * as React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import LandingPage from './components/LandingPage';

const DemoComponent = () => (
    <div>hello world</div>
);

const AppRoutes = () => (
    <Router>
        <Route path="/" exact component={LandingPage} />
        <Route path="/spotify-authorization-redirect" exact component={DemoComponent} />
    </Router>
);

export default AppRoutes;
