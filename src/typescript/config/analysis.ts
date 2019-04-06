export default {
  // Beats must be below this value to be considered "similar"
  distanceThreshold: 0.001,

  spotify: {
    // Spotify's analysis of a beat must be above this value (between 0 and 1) to be considered
    // (low confidence beats will be filtered)
    confidenceThreshold: 0.25,
  },
  distance_weights: {
    beat: {
      duration: 50,
      startLoudnessMs: 1,
      maxTimeLoudnessMs: 1,
      maxLoudness: 1,
      endLoudnessMs: 1,
    },
    notFirstBeatOrderInBar: 1,
    differentBeatOrderInBar: 1,
    differentSegmentLength: 100,
  },
};
