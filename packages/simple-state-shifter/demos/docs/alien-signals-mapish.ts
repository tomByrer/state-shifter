// wrapper derived from https://github.com/johnsoncodehk/alien-signals-starter
import { createReactiveSystem, Link, ReactiveNode, ReactiveFlags } from 'alien-signals/system';

const {
  link,
  unlink,
  propagate,
  checkDirty,
  shallowPropagate,
} = createReactiveSystem({
  update(signal: any) {
    return signal.update();
  },
  notify(effect: any) {
    queue.push(effect);
  },
  unwatched() { },
});

let cycle = 0;
let batchDepth = 0;
let activeSub: ReactiveNode | undefined;

const queue: Effect[] = [];

function shouldUpdate(sub: ReactiveNode): boolean {
  const flags = sub.flags;
  if (flags & ReactiveFlags.Dirty) {
    return true;
  }
  if (flags & ReactiveFlags.Pending) {
    if (checkDirty(sub.deps!, sub)) {
      return true;
    }
    sub.flags = flags & ~ReactiveFlags.Pending;
  }
  return false;
}

class Signal<T = any> implements ReactiveNode {
  subs: Link | undefined = undefined;
  subsTail: Link | undefined = undefined;
  flags: ReactiveFlags = ReactiveFlags.Mutable;
  value: T;
  pendingValue: T;

  constructor(value: T) {
    this.pendingValue = this.value = value;
  }

  get(): T {
    if (shouldUpdate(this) && this.update()) {
      const subs = this.subs;
      if (subs !== undefined) {
        shallowPropagate(subs);
      }
    }
    if (activeSub !== undefined) {
      link(this, activeSub, cycle);
    }
    return this.value;
  }

  set(value: T): void {
    this.pendingValue = value;
    this.flags = ReactiveFlags.Mutable | ReactiveFlags.Dirty;
    const subs = this.subs;
    if (subs !== undefined) {
      propagate(subs);
      if (batchDepth <= 0) {
        // flush()
        while (queue.length > 0) { queue.shift()!.run() }
      }
    }
  }

  update() {
    this.flags = ReactiveFlags.Mutable;
    return this.value !== (this.value = this.pendingValue);
  }
}

class Effect<T = any> implements ReactiveNode {
  deps: Link | undefined = undefined;
  depsTail: Link | undefined = undefined;
  flags: ReactiveFlags = ReactiveFlags.Watching;

  constructor(
    public fn: () => T
  ) { }

  run(): T {
    ++cycle;
    this.depsTail = undefined;
    this.flags = ReactiveFlags.Watching | ReactiveFlags.RecursedCheck;
    const prevSub = activeSub;
    activeSub = this;
    try {
      return this.fn();
    } finally {
      activeSub = prevSub;
      this.flags &= ~ReactiveFlags.RecursedCheck;
      let toRemove = this.depsTail !== undefined ? (this.depsTail as Link).nextDep : this.deps;
      while (toRemove !== undefined) {
        toRemove = unlink(toRemove, this);
      }
    }
  }
}

// below code is alien-signals-mapish (c)2026 Tom Byrer
// Enforce string keys to prevent the "number turns into string" snapshot bug
type StoreKey = string; 
type StoreValue<T = unknown> = Signal<T>;

export default class SignalMapish<T = unknown> {
  // pure dictionary with NO prototype chain (maximum speed, zero bugs)
  private store: Record<StoreKey, StoreValue<T>> = Object.create(null);
  constructor(presets: [StoreKey, T][]) {
    const len = presets.length
    for (let i = 0; i < len; i++) {
      const [key, value] = presets[i]
      this.store[key] = new Signal(value)
    }
  }

  effect<T>(fn: () => T): Effect<T> {
    const e = new Effect(fn);
    e.run();
    return e;
  }

  has(key: StoreKey): boolean {
    // speed over preventing footguns
    return this.store[key] !== undefined
  }

  get(key: StoreKey): T | undefined {
    //  Fast lookup
    return this.store[key]?.get()
  }

  set(key: StoreKey, value: T): void {
    // Safe update
    this.store[key]?.set(value)
  }

  // exporting current state as 'presets' 
  getSnapshot(): Array<[StoreKey, T]> {
    // assume Object.keys returns strings
    return Object.keys(this.store).map(key => [
      key, 
      this.store[key].get() as T
    ])
  }

  // merge only if NOT new; no overwrites of keys or values
  // you can use the result of getSnapshot() to merge in missing key/values
  mergePresets(presets: [StoreKey, T][]) {
    const len = presets.length
    for (let i = 0; i < len; i++) {
      const [key, value] = presets[i]
      if (!this.has(key)) {
        this.store[key] = new Signal(value)
      }
    }
  }

  // https://github.com/stackblitz/alien-signals/issues/62
  // pause signal updates; use when you want to batch several updates as one
  queueUpdates() { ++batchDepth }
  // resume queued updates from pause
  resumeUpdates() {
    if (--batchDepth <= 0){ /*flush()*/
      while (queue.length > 0){ queue.shift()!.run() }
    }
  }
}
