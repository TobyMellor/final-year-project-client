import {
  SEARCH_SPOTIFY_TRACK_SUCCESS,
  SEARCH_SPOTIFY_TRACK_FAILURE,
  SET_SELECTED_SPOTIFY_TRACK,
 } from '../config/redux';
import SearchTrack from '../services/api/spotify/SearchTrack';
import { AnyAction } from 'redux';
import { RemoteTrack } from '../models/search-track';
import {
  SetSelectedSpotifyTrackType,
  SearchSpotifyTrackFailureType,
  SearchSpotifyTrackSuccessType,
} from '../types/redux-actions';
import { ThunkDispatch } from 'redux-thunk';

export function searchSpotifyTrack(query: string): ThunkDispatch<{}, {}, AnyAction> {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    const response = await SearchTrack.request(query);
    if (response) {
      return dispatch(searchSpotifyTrackSuccess(response));
    }
    return dispatch(searchSpotifyTrackFailure());
  };
}

export const searchSpotifyTrackSuccess = (data: RemoteTrack[]): SearchSpotifyTrackSuccessType => {
  return {
    data,
    type: SEARCH_SPOTIFY_TRACK_SUCCESS,
  };
};

export const searchSpotifyTrackFailure = (): SearchSpotifyTrackFailureType => {
  return {
    type: SEARCH_SPOTIFY_TRACK_FAILURE,
  };
};

export const setSelectedSpotifyTrack = (ID: string, fileURL: string): SetSelectedSpotifyTrackType => {
  return {
    data: {
      ID,
      fileURL,
    },
    type: SET_SELECTED_SPOTIFY_TRACK,
  };
};
