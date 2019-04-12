import { AnimationCurve } from '../types/enums';
import * as bezierEasing from 'bezier-easing';

export default {
  panCatchupSpeed: 0.025,
  panAmount: 0.6,
  animationCurves: {
    [AnimationCurve.EASE]: bezierEasing(0.25, 0.1, 0.25, 1),
    [AnimationCurve.EASE_IN]: bezierEasing(0.42, 0, 1, 1),
    [AnimationCurve.EASE_OUT]: bezierEasing(0, 0, 0.58, 1),
    [AnimationCurve.LINEAR]: bezierEasing(0, 0, 1, 1),
  },
};
