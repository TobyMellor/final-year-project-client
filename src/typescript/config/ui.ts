export default {
  button: {
    // Time taken for the button to fade in
    fadeAnimationDurationMs: 100,
  },
  beat: {
    // Time taken for beats to expand when clicked
    expandAnimationDurationMs: 450,

    // The duration to wait before scrolling back to
    // the selected beat after no user scroll activity
    scrollBackAfterMs: 2500,

    // The CSS class colours available, to be chosen
    // by the timbre of the beat
    availableColours: [
      'light-black',
      'dark-black',
      'light-purple',
      'dark-purple',
      'light-blue',
      'dark-blue',
      'light-turquoise',
      'dark-turquoise',
      'light-green',
      'dark-green',
      'light-yellow',
      'dark-yellow',
      'light-orange',
      'dark-orange',
      'light-red',
      'dark-red',
    ],

    // The CSS class sizes available, to be chosen
    // by the loudness of the beat
    availableSizes: [
      'xxs',
      'xs',
      'sm',
      'md',
      'lg',
      'xl',
      'xxl',
    ],

    // Used for animation calculations
    beatWidthPx: 64,
    beatMarginPx: 16,
  },

  // If the BranchNav has been hidden for some amount of time, reset it
  // NOTE: This value must be at least greater than the fade-out animation
  resetBranchNavAfterHiddenMs: 5000,

  // The time taken for a 'smooth' scrollTo to complete
  scrollToDurationMs: 1000,
};
