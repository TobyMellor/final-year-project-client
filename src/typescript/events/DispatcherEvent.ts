import { FYPEvent } from '../types/enums';

export type Callback = {
  context: Object,
  callbackFn: (data: any) => void,
};

class DispatcherEvent {
  private eventName: string;
  private callbacks: Callback[];

  constructor(eventName: string) {
    this.eventName = eventName;
    this.callbacks = [];
  }

  registerCallback(callback: Callback) {
    this.callbacks.push(callback);
  }

  fire(data: any) {
    const callbacks = this.callbacks.copyWithin(0, 0);

    // Bind the callbacks to their context (so 'this' works inside the callback),
    // and run the callback
    callbacks.forEach(({ context, callbackFn }: Callback) => {
      const bindedCallbackFn = callbackFn.bind(context);

      return bindedCallbackFn(data);
    });
  }

  public getListenerCount(): number {
    return this.callbacks.length;
  }
}

export default DispatcherEvent;
