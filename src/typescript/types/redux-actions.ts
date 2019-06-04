import {
  SAVE_SPOTIFY_ACCESS_TOKEN,
  SET_SELECTED_SPOTIFY_TRACK_ID,
  SEARCH_SPOTIFY_TRACK_FAILURE,
  SEARCH_SPOTIFY_TRACK_SUCCESS,
} from '../config/redux';
import { OutputTrack } from '../models/search-track';

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
  data: OutputTrack[];
};

export type SearchSpotifyTrackFailureType = {
  type: typeof SEARCH_SPOTIFY_TRACK_FAILURE;
};

export type SetSelectedSpotifyTrackIDType = {
  type: typeof SET_SELECTED_SPOTIFY_TRACK_ID;
  data: string;
};