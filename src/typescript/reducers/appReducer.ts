import { SAVE_SPOTIFY_ACCESS_TOKEN } from '../constants/appConstants';
import { saveAccessTokenType } from '../actions/appActions';
import localStorage from '../utils/localStorage';

type appState = {
  accessToken: string | null;
  refreshToken: string | null;
};

type actionType = {
  type: string;
  data: saveAccessTokenType
};

const initialState: appState = {
  accessToken: localStorage.get('spotify_access_token') || null,
  refreshToken: localStorage.get('spotify_refresh_token') || null,
};

function appReducer(state = initialState, action: actionType) {
  switch (action.type) {
    case SAVE_SPOTIFY_ACCESS_TOKEN:
      const { accessToken, refreshToken } = action.data;
      return Object.assign({}, state, {
        accessToken,
        refreshToken,
      });
  }
}

export default appReducer;
