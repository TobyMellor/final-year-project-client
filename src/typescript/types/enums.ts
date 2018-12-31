export enum FYPEvent {

  // The Playing Track has been switched to another song
  // Signals that the branches should be analyzed for the new song
  PlayingTrackChanged = 'playing_track_changed',

  // The Branch Analysis has finished for the Playing Track
  // Signals that the new song and branches should be rendered
  PlayingTrackBranchesAnalyzed = 'playing_track_branches_analyzed',

  // The Playing Track has completed the first render since it was changed
  PlayingTrackRendered = 'playing_track_rendered',

  // The Music Service is requesting the next segment of beats to be queued for future play
  NextBeatsRequested = 'next_beats_requested',

  // The next beats have been chosen and can be queued for future play
  BeatsReadyForQueueing = 'beats_ready_for_queueing',
}
