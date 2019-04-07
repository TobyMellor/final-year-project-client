import DispatcherEvent, { Callback } from './DispatcherEvent';
import * as loggerService from '../services/logging/logger';

interface Events {
  [key: string]: DispatcherEvent;
}

class Dispatcher {
  private events: Events;
  private static _instance: Dispatcher = null;

  private constructor() {
    this.events = {};
  }

  public static getInstance(): Dispatcher {
    return this._instance || (this._instance = new this());
  }

  dispatch(eventName: string, data: any = null) {
    const event = this.events[eventName];

    loggerService.debug(`Event ${eventName} dispatched!`);

    if (event) {
      loggerService.debug(`Event ${eventName} fired to ${event.getListenerCount()} listener(s)!`);
      event.fire(data);
    }
  }

  on(eventName: string, callbackFn: Callback) {
    loggerService.debug(`Listener for ${eventName} registered!`);

    // If this is the first time we've seen this event, register it
    if (!this.events[eventName]) {
      this.events[eventName] = new DispatcherEvent();
    }

    return this.events[eventName]
               .registerCallback(callbackFn);
  }
}

export default Dispatcher;
