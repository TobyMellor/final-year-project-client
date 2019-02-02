export function getRandomInteger(): number {
  return Math.round(Math.random() * 100);
}

export function areArraysEqual<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i += 1) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
}

export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function isNumberNormalized(number: number): boolean {
  return 0 <= number && number <= 1;
}

// export function shouldUpdate
