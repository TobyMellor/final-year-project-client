declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: () => {};
  }
}

import { createStore, combineReducers, applyMiddleware } from 'redux';
import appReducer from './reducers/appReducer';

// const combinedReducers = combineReducers({
//   app: appReducer,
// });

const store = createStore(
  appReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
);

export default store;
