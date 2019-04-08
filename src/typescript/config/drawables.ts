import { BezierCurveType } from '../types/enums';

const songCircle = {
  resolution: 1,
  degreesInCircle: 360,
  colour: {
    edge: 0x000000,
    text: 0xFFFFFF,
    background: 0xFFFFFF,
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
    [BezierCurveType.NORMAL]: 0xD9D9D9,
    [BezierCurveType.NEXT]: songCircle.colour.edge,
    [BezierCurveType.SCAFFOLD]: 0xF1C40F,
    [BezierCurveType.PREVIEW]: 0x2ECC71,
  },
};

export default {
  bezierCurve,
  needle,
  songCircle,
};
