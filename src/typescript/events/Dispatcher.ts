import DispatcherEvent, { CallbackFn } from './DispatcherEvent';
import * as loggerService from '../services/logging/logger';
import config from '../config';

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

  dispatch(eventName: string, data: any) {
    const event = this.events[eventName];

    if (event) {
      event.fire(data);
    }
  }

  on(eventName: string, context: Object, callbackFn: CallbackFn) {
    loggerService.debug('EVENT FIRED:', eventName);

    if (!this.events[eventName]) {
      this.events[eventName] = new DispatcherEvent(eventName, context);
    }

    const event = this.events[eventName];

    return event.registerCallback(callbackFn);
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
