import { BezierCurveType, AnimationType, SongCircleType } from '../types/enums';

const background = {
  colour: {
    background: 0xEBE5E7,
  },
};

const songCircle = {
  resolution: 150,
  colour: {
    edge: {
      [SongCircleType.PARENT]: 0x000000,
      [SongCircleType.NEXT_PARENT_LOADING]: 0xF1C40F,
      [SongCircleType.NEXT_PARENT_READY]: 0x2ECC71,
      [SongCircleType.PARENT]: 0x000000,
      [SongCircleType.CHILD]: 0x000000,
      [SongCircleType.HIDDEN]: 0x000000,
    },
    text: 0xFFFFFF,
    background: 0xFFFFFF,
    darkOverlay: 0x000000,
  },
  opacity: {
    darkOverlay: 0.6,
  },

  // Child SongCircles will appear to load in staggered for effect, they will be randomly delayed between
  // config.songCircle.childMaxAnimationDelayMs to config.songCircle.childMaxAnimationDelayMs
  childMinAnimationDelayMs: 2500,
  childMaxAnimationDelayMs: 7500,
  minSongCircleSize: 0.5,
  maxSongCircleSize: 1.5,

  // Songs with a duration below this value will have their size set to minSongCircleSize
  minSongCircleDurationSecs: 100,

  // Songs with a duration above this value will have their size set to maxSongCircleSize
  maxSongCircleDurationSecs: 360,
};

const needle = {
  relativeWidth: 0.25,
  relativeHeight: 4,
};

const bezierCurve = {
  lineWidth: 13,
  dashSize: 0.05,
  dashSpacing: 0.3,
  colour: {
    [BezierCurveType.NORMAL]: 0xAAAAAA,
    [BezierCurveType.NEXT]: songCircle.colour.edge[SongCircleType.PARENT],
    [BezierCurveType.SCAFFOLD]: 0xF1C40F,
    [BezierCurveType.PREVIEW]: 0x2ECC71,
    [BezierCurveType.HIDDEN]: 0xAAAAAA,
  },
};

const animations: {
  [key in AnimationType]: {
    durationMs: number,
  }
} = {
  [AnimationType.FADE_IN]: {
    durationMs: 350,
  },
  [AnimationType.FADE_OUT]: {
    durationMs: 350,
  },
  [AnimationType.CHANGE_TYPE]: {
    durationMs: 350,
  },
};

export default {
  background,
  bezierCurve,
  needle,
  songCircle,
  animations,
};
