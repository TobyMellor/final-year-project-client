import '../sass/vendor.scss';
import '../sass/style.scss';

import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import AppRoutes from './routes';
import store from './store';

render(
    <Provider  store={store}>
        <AppRoutes />
    </Provider>,
    document.getElementById('root'),
);
