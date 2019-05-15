import '../sass/vendor.scss';
import '../sass/style.scss';

import * as React from 'react';
import { render } from 'react-dom';
import AppRoutes from './routes';

render(
    <AppRoutes />,
    document.getElementById('root'),
);
