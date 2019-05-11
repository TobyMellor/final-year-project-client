import { AnimationCurve } from '../types/enums';
import * as bezierEasing from 'bezier-easing';

export default {
  panCatchupSpeed: 0.025,
  panAmount: 0.25,
  animationCurves: {
    [AnimationCurve.EASE]: bezierEasing(0.25, 0.1, 0.25, 1),
    [AnimationCurve.EASE_IN]: bezierEasing(0.42, 0, 1, 1),
    [AnimationCurve.EASE_OUT]: bezierEasing(0, 0, 0.58, 1),
    [AnimationCurve.LINEAR]: bezierEasing(0, 0, 1, 1),
    [AnimationCurve.BOUNCE]: bezierEasing(0.12, 0.02, 0.03, 1.22),
  },
  sceneBaseDistance: -5,
  cameraFOV: 45,
  cameraClipNearDistance: 0.01,
  cameraClipFarDistance: 3000,
  maxRotationAnimationDurationMs: 250,
};
