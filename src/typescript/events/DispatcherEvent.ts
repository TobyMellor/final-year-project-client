export type CallbackFn = (data: any) => void;

class DispatcherEvent {
  private eventName: string;
  private callbackFns: CallbackFn[];

  constructor(eventName: string) {
    this.eventName = eventName;
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
    const callbacksFn = this.callbackFns.copyWithin(0, 0);

    callbacksFn.forEach((callbackFn: CallbackFn) => callbackFn(data));
  }
}

export default DispatcherEvent;
