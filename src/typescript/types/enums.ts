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

export enum BranchNavStatus {

  // The BranchNav's initial status. The user has not yet chosen the first beat
  CHOOSE_FIRST_BEAT = 'choose_first_beat',

  // The user has selected the first beat and needs to choose the second
  CHOOSE_SECOND_BEAT = 'choose_second_beat',

  // The user has chosen both beats and can click preview to listen to the branch
  PREVIEWABLE = 'previewable',

  // The user is currently previewing the branch they've made
  PREVIEWING = 'previewing',
}

export enum BeatListOrientation {
  TOP = 'top',
  BOTTOM = 'bottom',
}
