import { FYPEvent } from '../types/enums';

export type CallbackFn = (data: any) => void;

class DispatcherEvent {
  private eventName: string;
  private context: Object;
  private callbackFns: CallbackFn[];

  constructor(eventName: string, context: Object) {
    this.eventName = eventName;
    this.context = context;
    this.callbackFns = [];
  }

  registerCallback(callbackFn: CallbackFn) {
    this.callbackFns.push(callbackFn);
  }

  unregisterCallback(callbackFn: CallbackFn) {
    const index = this.callbackFns.indexOf(callbackFn);

    if (index > -1) {
      this.callbackFns.splice(index, 1);
    }
  }

  fire(data: any) {
    const context = this.context;
    const callbacksFn = this.callbackFns.copyWithin(0, 0);

    // Bind the callbacks to their context (so 'this' works inside the callback),
    // and run the callback
    callbacksFn.forEach((callbackFn: CallbackFn) => {
      const bindedCallbackFn = callbackFn.bind(context);

      return bindedCallbackFn(data);
    });
  }

  public getListenerCount(): number {
    return this.callbackFns.length;
  }
}

export default DispatcherEvent;
