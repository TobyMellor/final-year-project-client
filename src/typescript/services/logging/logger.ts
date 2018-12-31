import config from '../../config';

export function debug(...messages: any[]) {
  if (config.fyp.debug) {
    console.debug(...messages);
  }
}
