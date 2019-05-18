/**
 * Returns a number between 0 and 1, relative to the min and max
 *
 * @param number The number to normalize
 * @param min The min number in a dataset, where min ≠ max
 * @param max The max number in a dataset, where min ≠ max
 * @param from The normalized lower bound (default is 0)
 * @param to The normalized upper bound (default is 1)
 */
export function normalizeNumber(number: number, min: number, max: number, from: number = 0, to: number = 1): number {
  const cappedNumber = capNumberBetween(number, min, max);
  const normalizedNumber = (to - from) * (cappedNumber - min) / (max - min) + from;

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

export function euclideanDistance(firstNumbers: number[], secondNumbers: number[], weight: number = 1) {
  let sum = 0;

  firstNumbers.forEach((firstNumber, i) => {
    const distance = firstNumber - secondNumbers[i];
    sum += distance ** 2;
  });

  return Math.sqrt(sum) * weight;
}

export function getRandomInteger(from: number = 0, to: number = 100): number {
  return Math.round(Math.random() * to) + from;
}

export function getProgressFromTo(from: number, to: number, animationDecimal: number) {
  return from + (to - from) * animationDecimal;
}
