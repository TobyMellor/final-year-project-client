import {
  SEARCH_SPOTIFY_TRACK_SUCCESS,
  SEARCH_SPOTIFY_TRACK_FAILURE,
  SET_SELECTED_SPOTIFY_TRACK_ID,
 } from '../config/redux';
import SpotifyAPI from '../services/api/spotify/SpotifyAPI';
import SearchTrack from '../services/api/spotify/SearchTrack';
import { Dispatch } from 'redux';
import { OutputTrack } from '../models/search-track';
import {
  SetSelectedSpotifyTrackIDType,
  SearchSpotifyTrackFailureType,
  SearchSpotifyTrackSuccessType,
} from '../types/redux-actions';

export function searchSpotifyTrack(query: string) {
  return async (dispatch: Dispatch) => {
    const response = await SearchTrack.request(query);
    if (response) {
      return dispatch(searchSpotifyTrackSuccess(response));
    }
    return dispatch(searchSpotifyTrackFailure());
  };
}

export const searchSpotifyTrackSuccess = (data: OutputTrack[]): SearchSpotifyTrackSuccessType => {
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

export const setSelectedSpotifyTrackID = (id: string): SetSelectedSpotifyTrackIDType => {
  return {
    data: id,
    type: SET_SELECTED_SPOTIFY_TRACK_ID,
  };
};
