import { SAVE_SPOTIFY_ACCESS_TOKEN } from '../constants/app-constants';

export type saveAccessTokenType = {
  accessToken: string;
  refreshToken: string;
};

export type saveAccessTokenActionType = {
  type: typeof SAVE_SPOTIFY_ACCESS_TOKEN;
  data: saveAccessTokenType;
};

export const saveAccessToken = (data: saveAccessTokenType): saveAccessTokenActionType => {
  return {
    data,
    type: SAVE_SPOTIFY_ACCESS_TOKEN,
  };
};
