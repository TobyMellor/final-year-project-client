/**
 * Returns a number between 0 and 1, relative to the min and max
 *
 * @param number The number to normalize
 * @param min The min number in a dataset, where min ≠ max
 * @param max The max number in a dataset, where min ≠ max
 */
export function normalizeNumber(number: number, min: number, max: number): number {
  const cappedNumber = capNumberBetween(number, min, max);
  const normalizedNumber = (cappedNumber - min) / (max - min);

  return normalizedNumber;
}

/**
 * Cap a number at a min and max value.
 *
 * e.g. If the max cap is 100, but the number is 1000,
 * the number will be capped at 100.
 *
 * @param number The number to cap
 * @param min The minimum number before capping
 * @param max The maximum number before capping
 */
function capNumberBetween(number: number, min: number, max: number): number {
  const lowerCapped = Math.max(number, min);
  const numberCapped = Math.min(lowerCapped, max);

  return numberCapped;
}

export function getMin(numbers: number[]) {
  return Math.min(...numbers);
}

export function getMax(numbers: number[]) {
  return Math.max(...numbers);
}

export function distance(firstNumber: number, secondNumber: number, weight: number = 1) {
  return Math.abs(firstNumber - secondNumber) * weight;
}
