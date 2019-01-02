import 'normalize-scss';
import '../sass/vendor.scss';
import '../sass/style.scss';

import * as React from 'react';
import { render } from 'react-dom';
import App from './components/App';

render(
    <App />,
    document.getElementById('root'),
);
