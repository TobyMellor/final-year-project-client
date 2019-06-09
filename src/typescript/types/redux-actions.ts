import {
  SAVE_SPOTIFY_ACCESS_TOKEN,
  SET_SELECTED_SPOTIFY_TRACK,
  SEARCH_SPOTIFY_TRACK_FAILURE,
  SEARCH_SPOTIFY_TRACK_SUCCESS,
} from '../config/redux';
import { RemoteTrack } from '../models/search-track';

export type SaveAccessTokenActionDataType = {
  accessToken: string;
  refreshToken: string;
};

export type SaveAccessTokenActionType = {
  type: typeof SAVE_SPOTIFY_ACCESS_TOKEN;
  data: SaveAccessTokenActionDataType;
};

export type SearchSpotifyTrackSuccessType = {
  type: typeof SEARCH_SPOTIFY_TRACK_SUCCESS;
  data: RemoteTrack[];
};

export type SearchSpotifyTrackFailureType = {
  type: typeof SEARCH_SPOTIFY_TRACK_FAILURE;
};

export type SetSelectedSpotifyTrackType = {
  type: typeof SET_SELECTED_SPOTIFY_TRACK;
  data: {
    ID: string;
    fileURL: string;
  };
};
