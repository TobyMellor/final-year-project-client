export function sample(array: string[]): Object {
  const raw: string = array[Math.floor(Math.random() * array.length)];

  return JSON.parse(raw);
}
