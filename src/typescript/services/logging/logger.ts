import config from '../../config';

export function debug(...messages: any[]) {
  if (config.fyp.debug && process.env.NODE_ENV !== 'test') {
    console.debug(...messages);
  }
}
