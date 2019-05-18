export default {
  setup: {
    init_webgl_failed: 'Unable to initialize WebGL. Your browser or machine may not support it.',
    init_shader_failed: 'Unable to initialize the shader program: ',
    compile_shader_failed: 'An error occurred compiling the shaders: ',
    canvas_not_yet_initialised: 'Error: The canvas service was used before it was initialised.',
  },
  react: {
    bottom_branch_nav: {
      not_yet_shown: 'Loading…',
      choose_first_beat: 'Select the first Beat',
      choose_second_beat: 'Select the second Beat',
      previewable: 'Preview Branch or choose again',
      previewing: 'Confirm Branch or choose again',
      finished: 'Creating the branch…',
    },
  },
  errors: {
    not_found: 'No beat found!',
    action: {
      invalid_branch_target: 'Requested a target that is not obtainable!',
      invalid_branch_input: 'Attempted to create a Branch leading to the same place!',
      invalid_transition_input: 'The originTrack and destinationTrack must be different!',
      not_found: 'ActionType not found!',
      invalid_branch_manager: 'The forward and backwards branch counts must be the same!',
    },
    ui: {
      not_normalized: 'Attempted to render beats from un-normalized values!',
    },
    api: {
      mock_not_found: 'Could not find the desired Mock!',
    },
    canvas: {
      animation_not_found: 'AnimationType not found!',
    },
    web_audio: {
      next_track_not_found: 'You must start loading the next track through startLoadingNextTrack!',
      empty_beat_batch: 'Attempted to request no beats!',
    },
    fixture: {
      not_enough_beats: 'Not enough beats for desired quantity!',
    },
  },
};
