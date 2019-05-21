import { SAVE_SPOTIFY_ACCESS_TOKEN } from '../config/redux';

export type SaveAccessTokenActionDataType = {
  accessToken: string;
  refreshToken: string;
};

export type SaveAccessTokenActionType = {
  type: typeof SAVE_SPOTIFY_ACCESS_TOKEN;
  data: SaveAccessTokenActionDataType;
};
