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
    background: 0xEBE5E7,
  },
  opacity: {
    darkOverlay: 0.6,
  },
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
    [BezierCurveType.NORMAL]: 0xaaaaaa,
    [BezierCurveType.NEXT]: songCircle.colour.edge,
    [BezierCurveType.SCAFFOLD]: 0xF1C40F,
    [BezierCurveType.PREVIEW]: 0x2ECC71,
  },
};

export default {
  background,
  bezierCurve,
  needle,
  songCircle,
};
