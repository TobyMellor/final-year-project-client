import { SAVE_SPOTIFY_ACCESS_TOKEN } from '../config/redux';

export type saveAccessTokenActionDataType = {
  accessToken: string;
  refreshToken: string;
};

export type saveAccessTokenActionType = {
  type: typeof SAVE_SPOTIFY_ACCESS_TOKEN;
  data: saveAccessTokenActionDataType;
};
