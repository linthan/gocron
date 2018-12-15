import { EventEmitter } from 'eventemitter3';

export class Emitter {
  public emitter: any;

  constructor() {
    this.emitter = new EventEmitter();
  }

  public emit(name, data?) {
    this.emitter.emit(name, data);
  }

  public on(name, handler) {
    this.emitter.on(name, handler);
  }

  public removeAllListeners(evt?) {
    this.emitter.removeAllListeners(evt);
  }

  public off(name, handler) {
    this.emitter.off(name, handler);
  }
}
