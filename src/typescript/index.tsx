import '../sass/style.scss';

import * as React from 'react';
import { render } from 'react-dom';
import App from './components/App';

render(
    <App message="Toby Mellor" />,
    document.getElementById('root'),
);
