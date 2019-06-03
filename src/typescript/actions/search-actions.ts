import { SEARCH_SPOTIFY_TRACK_SUCCESS, SEARCH_SPOTIFY_TRACK_FAILURE } from '../config/redux';
import SpotifyAPI from '../services/api/spotify/SpotifyAPI';
import SearchTrack from '../services/api/spotify/SearchTrack';
import { Dispatch } from 'redux';
import { OutputTrack } from '../models/search-track';

export function searchSpotifyTrack(query: string) {
  return async (dispatch: Dispatch) => {
    const response = await SearchTrack.request(query);
    if (response) {
      return dispatch(searchSpotifyTrackSuccess(response));
    }
    return dispatch(searchSpotifyTrackFailure());
  };
} 

export const searchSpotifyTrackSuccess = (data: OutputTrack[]) => {
  return {
    data,
    type: SEARCH_SPOTIFY_TRACK_SUCCESS,
  };
};

export const searchSpotifyTrackFailure = () => {
  return {
    type: SEARCH_SPOTIFY_TRACK_FAILURE,
  };
};
