export function degreesToRadians(degrees: number) {
  const radians = degrees * (Math.PI / 180);

  return radians % (2 * Math.PI);
}

export function radiansToDegrees(radians: number) {
  const degrees = radians * (180 / Math.PI);

  return degrees % 360;
}

export function percentageToDegrees(percentage: number) {
  // How many degrees we need to rotate circles so "0%" appears at the top
  const OFFSET_AMOUNT_DEGREES = 90;
  const decimal = percentage / 100;

  // Inverse so percentage is clockwise, to make
  // 25% appear on the right of the circle instead of the left
  const inversedDecimal = 1 - decimal;
  const degrees = inversedDecimal * 360;

  // How many degrees we need to rotate circles so "0%" appears at the top
  const degreesOffset = degrees + OFFSET_AMOUNT_DEGREES;

  return degreesOffset % 360;
}

export function percentageToRadians(percentage: number) {
  const degrees = percentageToDegrees(percentage);
  const radians = degreesToRadians(degrees);

  return radians;
}
