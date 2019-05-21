import { SAVE_SPOTIFY_ACCESS_TOKEN } from '../config/redux';
import * as localStorage from '../utils/localStorage';
import { saveAccessTokenActionDataType } from '../types/redux-actions';

type appState = {
  accessToken: string | null;
  refreshToken: string | null;
};

type actionType = {
  type: string;
  data: saveAccessTokenActionDataType;
};

const initialState: appState = {
  accessToken: localStorage.get('spotify_access_token') || null,
  refreshToken: localStorage.get('spotify_refresh_token') || null,
};

function appReducer(state = initialState, action: actionType) {
  switch (action.type) {
    case SAVE_SPOTIFY_ACCESS_TOKEN:
      const { accessToken, refreshToken } = action.data;
      return {
        ...state,
        accessToken,
        refreshToken,
      };
    default:
      return state;
  }
}

export default appReducer;
