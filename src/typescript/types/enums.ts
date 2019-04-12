export enum FYPEvent {
  // First event when the page loads, and also fired when a transition has been requested
  // Triggers the loading of the first track and the Branch Analysis
  TrackChangeRequested = 'track_change_requested',

  // Fired when all branches for this song have been generated
  // Triggers the Transition Analysis, the BranchNav initialization, and hidden rendering of branches
  BranchesAnalyzed = 'branches_analyzed',

  // Fired when similar tracks and the best transitions have been identified
  // Triggers the rendering of child song circles, and signaling to the ActionDecider that transitions can now be made
  TransitionsAnalyzed = 'transitions_analyzed',

  // Fired when a branch is manually created, e.g. through the BranchNav
  // Triggers the immediate rendering of the branch
  PlayingTrackBranchAdded = 'playing_track_branch_added',

  // Fired as soon as the first .mp3 has loaded, or when a transition is queued
  // Triggers the rendering of the SongCircle or transitions, and requests the next beats to be queued
  TrackChanged = 'track_changed',

  // Fired when any child track .mp3s are loaded
  // Lets the ActionDecider know that the selected transition can now be taken in the next pass
  TrackChangeReady = 'track_change_ready',

  // Fired when the transition has started
  // Triggers the transition in the CanvasService
  TrackChanging = 'track_changing',

  // Fired when the PlayingTrackChanged, or when a BeatBatch has finished
  // Triggers the decision of which Branch will come next, or which transition should come next
  BeatBatchRequested = 'next_beats_requested',

  // Fired when either the next branch has been identified or the next transition has been identified
  // Triggers the queueing of these beats and any transitions
  BeatBatchReady = 'beat_batch_ready',

  // Fired when the first beat in the beat batch has started playing
  // Triggers the animation of the playing needle
  // NOTE: This uses setTimeout, which is inaccurate. Don't use it for anything audio related
  BeatBatchPlaying = 'beat_batch_playing',

  // Fired when the audio needs to be stopped, e.g. when the user starts previewing in the BranchNav
  // Triggers the stopping of the needle animation and audio
  BeatBatchStopped = 'beat_batch_stopped',
}

export enum BranchNavStatus {
  // Advances from this state when the BranchNav is shown for the first time
  NOT_YET_SHOWN = 'not_yet_shown',

  // The BranchNav's initial status. The user has not yet chosen the first beat
  CHOOSE_FIRST_BEAT = 'choose_first_beat',

  // The user has selected the first beat and needs to choose the second
  CHOOSE_SECOND_BEAT = 'choose_second_beat',

  // The user has chosen both beats and can click preview to listen to the branch
  PREVIEWABLE = 'previewable',

  // The user is currently previewing the branch they've made
  PREVIEWING = 'previewing',

  // The branch is being created and the BranchNav is about to close
  FINISHED = 'finished',
}

export enum BeatListOrientation {
  TOP = 'top',
  BOTTOM = 'bottom',
}

export enum NeedleType {
  // Indicates where the is in the song
  // Always present when music is playing
  // Focused when BranchNav hidden or BranchNav.state === PREVIEWING
  PLAYING = 'playing',

  // Indicates where the user is scrolled in the BranchNav
  // Always present when BranchNav is shown
  // Focused when BranchNav.state !== PREVIEWING
  BRANCH_NAV = 'branch_nav',
}

export enum BranchType {
  FORWARD = 'forward',
  BACKWARD = 'backward',
}

export enum BezierCurveType {
  // Exists in the song, but will not be played next (faded out)
  NORMAL = 'normal',

  // Will be played next in the song (darker)
  NEXT = 'next',

  // The user is currently scrolling through the BranchNav (dashed)
  SCAFFOLD = 'scaffold',

  // The user is previewing this branch in the BranchNav
  PREVIEW = 'preview',

  // Branch to be rendered in the next song, and will be visible after the transition
  HIDDEN = 'hidden',
}

// TODO: Implement more!
export enum TransitionType {
  IMMEDIATE = 'immediate',
  FADE = 'fade',
}

export enum SongCircleType {
  // This circle is in the middle of the screen (a parent circle, no artwork)
  PARENT = 'parent',

  // This circle is a child circle
  CHILD = 'child',

  // This is a child circle of a child circle, and is therefore not rendered
  HIDDEN = 'hidden',
}

export enum ButtonColour {
  Primary = 'btn-primary',
  Success = 'btn-success',
  Danger = 'btn-danger',
  Warning = 'btn-warning',
}
