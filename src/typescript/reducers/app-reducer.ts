import { SAVE_SPOTIFY_ACCESS_TOKEN } from '../config/redux';
import * as localStorage from '../utils/localStorage';
import { SaveAccessTokenActionDataType } from '../types/redux-actions';
import { AppState } from '../types/redux-state';

type ActionType = {
  type: string;
  data: SaveAccessTokenActionDataType;
};

const initialState: AppState = {
  accessToken: localStorage.get('spotify_access_token') || null,
  refreshToken: localStorage.get('spotify_refresh_token') || null,
};

function appReducer(state = initialState, action: ActionType) {
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
