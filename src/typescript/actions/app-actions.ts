import { SAVE_SPOTIFY_ACCESS_TOKEN } from '../config/redux';
import { SaveAccessTokenActionType, SaveAccessTokenActionDataType } from '../types/redux-actions';

export const saveAccessToken = (data: SaveAccessTokenActionDataType): SaveAccessTokenActionType => {
  return {
    data,
    type: SAVE_SPOTIFY_ACCESS_TOKEN,
  };
};
