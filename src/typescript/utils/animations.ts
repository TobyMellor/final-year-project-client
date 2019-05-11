import * as conversions from './conversions';
import { MeshAnimationOptions } from '../services/canvas/drawables/Updatable';
import * as math from './math';

export function defaultChangeType(options: MeshAnimationOptions) {
  if (options.startRGB != null && options.endRGB != null) {
    defaultChangeColour(options);
  }

  if (options.startScale && options.endScale) {
    defaultChangeScale(options);
  }
}

export function defaultChangeColour({
  animationDecimal,
  startRGB: [startR, startG, startB],
  endRGB: [endR, endG, endB],
  geometry,
  material,
}: MeshAnimationOptions) {
  const currentR = math.getProgressFromTo(startR, endR, animationDecimal);
  const currentG = math.getProgressFromTo(startG, endG, animationDecimal);
  const currentB = math.getProgressFromTo(startB, endB, animationDecimal);

  const currentHEX = conversions.rgbToDecimal(currentR, currentG, currentB);

  material.color.setHex(currentHEX);
  geometry.colorsNeedUpdate = true;
}

export function defaultChangeScale({ animationDecimal, startScale, endScale, mesh }: MeshAnimationOptions) {
  const scale = math.getProgressFromTo(startScale, endScale, animationDecimal);
  mesh.scale.x = mesh.scale.y = scale;
}

export function defaultFadeIn({ animationDecimal, material }: MeshAnimationOptions) {
  material.opacity = animationDecimal;
}

export function defaultFadeOut(options: MeshAnimationOptions) {
  defaultFadeIn({ ...options, animationDecimal: 1 - options.animationDecimal });
}
