declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: () => {};
  }
}

import { createStore, combineReducers } from 'redux';
import appReducer from './reducers/app-reducer';

const combinedReducers = combineReducers({
  app: appReducer,
});

const store = createStore(
  combinedReducers,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
);

export default store;
