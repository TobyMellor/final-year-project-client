import { SAVE_SPOTIFY_ACCESS_TOKEN } from '../config/redux';
import { saveAccessTokenActionType, saveAccessTokenActionDataType } from '../types/redux-actions';

export const saveAccessToken = (data: saveAccessTokenActionDataType): saveAccessTokenActionType => {
  return {
    data,
    type: SAVE_SPOTIFY_ACCESS_TOKEN,
  };
};
