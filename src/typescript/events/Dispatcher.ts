import DispatcherEvent, { CallbackFn } from './DispatcherEvent';
import * as loggerService from '../services/logging/logger';
import config from '../config';
import { FYPEvent } from '../types/enums';

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

  on(eventName: string, context: Object, callbackFn: CallbackFn) {
    loggerService.debug(`Listener for ${eventName} registered!`);

    // If this is the first time we've seen this event, register it
    if (!this.events[eventName]) {
      this.events[eventName] = new DispatcherEvent(eventName, context);
    }

    return this.events[eventName]
               .registerCallback(callbackFn);
  }

  off(eventName: string, callbackFn: CallbackFn) {
    const event = this.events[eventName];

    if (event) {
      event.unregisterCallback(callbackFn);
      delete this.events[eventName];
    }
  }
}

export default Dispatcher;
