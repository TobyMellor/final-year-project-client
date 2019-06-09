import {
  SEARCH_SPOTIFY_TRACK_SUCCESS,
  SEARCH_SPOTIFY_TRACK_FAILURE,
  SET_SELECTED_SPOTIFY_TRACK,
} from '../config/redux';
import { SearchState } from '../types/redux-state';

type ActionType = {
  type: string;
  data: any;
};

const initialState: SearchState = {
  tracks: [],
  selectedSpotifyTrackID: '',
  selectedSpotifyTrackFileURL: '',
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
    case SET_SELECTED_SPOTIFY_TRACK:
      return {
        ...state,
        selectedSpotifyTrackID: action.data.ID,
        selectedSpotifyTrackFileURL: action.data.fileURL,
      };
    default:
      return state;
  }
}

export default searchReducer;
