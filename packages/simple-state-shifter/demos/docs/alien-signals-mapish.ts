import { createReactiveSystem, Link, ReactiveNode, ReactiveFlags } from 'alien-signals/system';

const {
  link,
  unlink,
  propagate,
  checkDirty,
  shallowPropagate,
} = createReactiveSystem({
  update(signal: Computed | Signal) {
    return signal.update();
  },
  notify(effect: Effect) {
    queue.push(effect);
  },
  unwatched() { },
});

let cycle = 0;
let batchDepth = 0;
let activeSub: ReactiveNode | undefined;

const queue: Effect[] = [];

// export function signal<T>(): Signal<T | undefined>;
// export function signal<T>(oldValue: T): Signal<T>;
// export function signal<T>(oldValue?: T): Signal<T | undefined> {
//   return new Signal(oldValue);
// }

// export function computed<T>(getter: () => T): Computed<T> {
//   return new Computed<T>(getter);
// }

// export function effect<T>(fn: () => T): Effect<T> {
//   const e = new Effect(fn);
//   e.run();
//   return e;
// }

// // https://github.com/stackblitz/alien-signals/issues/62
// // queue pause signal updates
// export function startBatch() {
//   ++batchDepth;
// }
// // resume queued updates from pause
// export function endBatch() {
//   if (--batchDepth === 0) {
//     flush();
//   }
// }

function flush() {
  while (queue.length > 0) {
    queue.shift()!.run();
  }
}

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
        while (queue.length > 0){ queue.shift()!.run() }
      }
    }
  }

  // add(delta: string | number): void {
  // 	const current = this.value as any;
  // 	const newValue = current + delta;
  // 	this.set(newValue as T);
  // }

  update() {
    this.flags = ReactiveFlags.Mutable;
    return this.value !== (this.value = this.pendingValue);
  }
}

// class Computed<T = any> implements ReactiveNode {
//   value: T | undefined = undefined;
//   subs: Link | undefined = undefined;
//   subsTail: Link | undefined = undefined;
//   deps: Link | undefined = undefined;
//   depsTail: Link | undefined = undefined;
//   flags: ReactiveFlags = ReactiveFlags.Mutable | ReactiveFlags.Dirty;

//   constructor(
//     public getter: () => T
//   ) { }

//   get(): T {
//     if (shouldUpdate(this) && this.update()) {
//       const subs = this.subs;
//       if (subs !== undefined) {
//         shallowPropagate(subs);
//       }
//     }
//     if (activeSub !== undefined) {
//       link(this, activeSub, cycle);
//     }
//     return this.value!;
//   }

//   update(): boolean {
//     ++cycle;
//     this.depsTail = undefined;
//     this.flags = ReactiveFlags.Mutable | ReactiveFlags.RecursedCheck;
//     const prevSub = activeSub;
//     activeSub = this;
//     try {
//       return this.value !== (this.value = this.getter());
//     } finally {
//       activeSub = prevSub;
//       this.flags &= ~ReactiveFlags.RecursedCheck;
//       let toRemove = this.depsTail !== undefined ? (this.depsTail as Link).nextDep : this.deps;
//       while (toRemove !== undefined) {
//         toRemove = unlink(toRemove, this);
//       }
//     }
//   }
// }

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

  // stop(): void {
  //   let dep = this.deps;
  //   while (dep !== undefined) {
  //     dep = unlink(dep, this);
  //   }
  // }
}


// (c)2026 Tom Byrer
// import { effect as ASeffect, signal } from './alien-signals-getset'

type Signal<T> = { get(): T; set(value: T): void }
type StoreKey = any //FIXME Matches JS Map key flexibility (any value)
type StoreValue<T = unknown> = Signal<T>

export default class SignalMapish<T = unknown> {
  private store: Record<StoreKey, StoreValue<T>> = {}

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
    return key in this.store
  }

  get(key: StoreKey): T | undefined {
    return this.has(key) ? this.store[key].get() : undefined
  }

  set(key: StoreKey, value: T): void {
    const storedSignal = this.store[key]
    if (storedSignal && typeof storedSignal.set === 'function') {
      storedSignal.set(value)
    }
  }

  getSnapshot(): Array<Array<T>> {
    return Object.keys(this.store).map(key => [key, this.store[key].get()])
  }

  // pause signal updates
  queueUpdates(){ ++batchDepth }
  // resume queued updates from pause
  resumeUpdates(){
    if (--batchDepth <= 0){ /*flush()*/
      while (queue.length > 0){ queue.shift()!.run() }
    }
  }


  // add(key: StoreKey, value: string | number): void {
  //   const storedSignal = this.store[key]
  //   if (storedSignal && typeof storedSignal.set === 'function') {
  //     const currentValue = storedSignal.get()
  //     storedSignal.set((currentValue as any) + value)
  //   }
  // }
}