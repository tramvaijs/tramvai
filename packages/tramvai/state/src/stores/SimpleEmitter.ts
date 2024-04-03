type Listener = (...args: Array<any>) => void;
export class SimpleEmitter {
  listeners: Set<Listener> = new Set();

  emit(name?: string) {
    this.listeners.forEach((listener) => {
      listener();
    });
  }

  addListener(event: string, fn: Listener) {
    this.listeners.add(fn);
  }

  on(event: string, fn: Listener) {
    this.addListener(event, fn);
  }

  removeListener(event: string, fn: Listener) {
    this.listeners.delete(fn);
  }

  off(event: string, fn: Listener) {
    this.removeListener(event, fn);
  }
}
