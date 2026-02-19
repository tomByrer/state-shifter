// wrapper derived from https://github.com/johnsoncodehk/alien-signals-starter
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
// end wrapper

/* v1.0.0 signaling-simple-state-shifter (C)2025-2026 Tom Byrer, rights reserved, but ask me about OSS License */
export default function createMachine(
  definition, // state-transition object
  // data=new Map([['state','']]), // allow external state & context storage, must have get(key) & set(key, value) methods
  // stateId='state' // in case you want to run mulitple machines in same data
){
  // init
  // initial state must be 2nd place in the `data` object
  const state = new Signal( Object.keys(definition)[0] )

  const machine = {
    trigger(str){ // AKA 'event'
      // allows `event(param)` being passed as a string, not a function call
      const { event, param } = str.match(/^(?<event>\w+)(?:\((?<param>[^)]+)\))?$/).groups
      const currentState =  definition[ state.get() ]
      const targetState = currentState[event]
      let newState = ''
      switch (typeof targetState){
        case 'string': // least CPU cycles first
          newState = targetState
          break
        case 'function':
          const returned = targetState(param)
          if (returned !== undefined){ newState = returned }
          break
        default: // undefined, etc
          // noop
        break
      }
      if (newState){
        state.set(newState)
      }
      // no return; the data-state has your result, if you need it right away then use a signal library for `data`
    },
  }

  // return current FSM state
  machine.getState = function(){ return state.get() }
  // return available 'trigger' words for the current FSM state
  machine.getTriggers = function(){ return Object.keys( definition[ state.get() ]) }

  return machine
}
