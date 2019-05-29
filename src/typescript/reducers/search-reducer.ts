import { SEARCH_SPOTIFY_TRACK_SUCCESS, SEARCH_SPOTIFY_TRACK_FAILURE } from '../config/redux';
import { SearchState } from '../types/redux-state';

type ActionType = {
  type: string;
  data: object;
};

const initialState: SearchState = {
  tracks: [],
};

function searchReducer(state = initialState, action: ActionType) {
  switch (action.type) {
    case SEARCH_SPOTIFY_TRACK_SUCCESS:
      return {
        ...state,
        tracks: action.data,
      };
    case SEARCH_SPOTIFY_TRACK_FAILURE:
      return {
        ...state,
        tracks: [],
      };
    default:
      return state;
  }
}

export default searchReducer;
