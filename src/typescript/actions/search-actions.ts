import { SEARCH_SPOTIFY_TRACK, SEARCH_SPOTIFY_TRACK_SUCCESS, SEARCH_SPOTIFY_TRACK_FAILURE } from '../config/redux';

export const searchSpotifyTrack = (data: any) => {
  return {
    data,
    type: SEARCH_SPOTIFY_TRACK,
  };
};

export const searchSpotifyTrackSuccess = (data: any) => {
  return {
    data,
    type: SEARCH_SPOTIFY_TRACK_SUCCESS,
  };
};

export const searchSpotifyTrackFailure = (data: any) => {
  return {
    data,
    type: SEARCH_SPOTIFY_TRACK_FAILURE,
  };
};
