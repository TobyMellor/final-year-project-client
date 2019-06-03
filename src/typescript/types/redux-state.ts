
export type SearchState = {
  tracks: object[];
  selectedSpotifyTrackID: string;
};

export type AppState = {
  accessToken: string | null;
  refreshToken: string | null;
};

export type CombinedState = {
  app: AppState;
  search: SearchState;
};
