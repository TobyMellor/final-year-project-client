import config from '../../config';

export function debug(...messages: string[]) {
  if (config.fyp.debug) {
    console.debug(...messages);
  }
}
