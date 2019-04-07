
export type Callback = (data: any) => void;

class DispatcherEvent {
  private callbacks: Callback[];

  constructor() {
    this.callbacks = [];
  }

  registerCallback(callback: Callback) {
    this.callbacks.push(callback);
  }

  fire(data: any) {
    const callbacks = this.callbacks.copyWithin(0, 0);

    // Bind the callbacks to their context (so 'this' works inside the callback),
    // and run the callback
    callbacks.forEach((callbackFn: Callback) => callbackFn(data));
  }

  public getListenerCount(): number {
    return this.callbacks.length;
  }
}

export default DispatcherEvent;
