import { BezierCurveType } from '../types/enums';

const background = {
  colour: {
    background: 0xEBE5E7,
  },
};

const songCircle = {
  resolution: 1,
  degreesInCircle: 360,
  colour: {
    edge: 0x000000,
    text: 0xFFFFFF,
    background: 0xFFFFFF,
    darkOverlay: 0x000000,
  },
  opacity: {
    darkOverlay: 0.6,
  },

  // Child SongCircles will appear to load in staggered for effect, they will be randomly delayed between
  // config.songCircle.childMaxAnimationDelayMs to config.songCircle.childMaxAnimationDelayMs
  childMinAnimationDelayMs: 5000,
  childMaxAnimationDelayMs: 15000,
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
    [BezierCurveType.NEXT]: songCircle.colour.edge,
    [BezierCurveType.SCAFFOLD]: 0xF1C40F,
    [BezierCurveType.PREVIEW]: 0x2ECC71,
    [BezierCurveType.HIDDEN]: 0xAAAAAA,
  },
};

export default {
  background,
  bezierCurve,
  needle,
  songCircle,
  fadeInDurationMs: 350,
  fadeOutDurationMs: 350,
  colourChangeDurationMs: 350,
};
