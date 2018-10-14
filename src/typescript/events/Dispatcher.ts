import DispatcherEvent, { CallbackFn } from './DispatcherEvent';

interface Events {
  [key: string]: DispatcherEvent;
}

class Dispatcher {
  private events: Events;

  constructor() {
    this.events = {};
  }

  dispatch(eventName: string, data: any) {
    const event = this.events[eventName];

    if (event) {
      event.fire(data);
    }
  }

  on(eventName: string, callbackFn: CallbackFn) {
    if (!this.events[eventName]) {
      this.events[eventName] = new DispatcherEvent(eventName);
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
