export default {
  // What distance is considered *really* bad and should be completely discarded
  discardDistanceThreshold: 100,

  // Beats must be below this value to be considered "similar"
  normalizedDistanceThreshold: 0.5,

  // How long a branch must be
  minimumBranchBeatSize: 8,

  spotify: {
    // Spotify's analysis of a beat must be above this value (between 0 and 1) to be considered
    // (low confidence beats will be filtered)
    confidenceThreshold: 0.25,
  },
  distance_weights: {
    beat: {
      duration: 0.1,
      startLoudnessMs: 0.01,
      maxTimeLoudnessMs: 0,
      maxLoudness: 0.01,
      endLoudnessMs: 0,
      timbre: 1,
      pitches: 10,
      confidence: 1,
    },
    notFirstBeatOrderInBar: 10,
    differentBeatOrderInBar: 100,
    differentSegmentLength: 100,
  },
};
