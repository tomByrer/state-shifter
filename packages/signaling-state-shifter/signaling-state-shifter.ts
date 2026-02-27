// using simple-state-shifter FSM with functions
import SignalMapish from 'alien-signals-mapish' 

// here we use SignalMapish; has get() & set() API like Map() along with merge & snapshot helpers
export function createMaps(
  DEF: any,
  stateKey = DEF.meta.id + 'State',
  merge: any = false, // pass the Map (or Mapish) you want to merge
){
  const defaultState = Object.keys(DEF.states)[0]
  const presets = (DEF?.ctx) ? DEF.ctx : []
  const stateCtxEntry = presets.find((item: any[]) => item[0] === stateKey)
  if (!stateCtxEntry) {
    presets.push([stateKey, defaultState])
  }
  else if (!stateCtxEntry[1] || !DEF.states[stateCtxEntry[1]]) {
    stateCtxEntry[1] = defaultState
  }

  if (merge){
    merge.mergePresets(presets)
    return merge
  }
  else{
    return new SignalMapish(presets)
  }
}

export interface MachineSnapshot {
  meta: Record<string, any>;
  ctx: Array<[StoreKey, any]>;
}
export interface FSMContext {
  ctx: SignalMapish<any>;
  fn: Record<string, any>;
  machine: {
    trigger(str: string): void;
    getState(): string;
    getTriggers(): string[];
    getSnapshot(): MachineSnapshot;
  };
}
export default function createMachine(
  DEF: any,
  stateKey: string =  DEF.meta.id + 'State',
  merge: any = false, // pass the Map (or Mapish) you want to merge
){
  const ctx: any = createMaps(DEF, stateKey, merge)
  const fsmContext: FSMContext = { ctx, fn: {}, machine: null as any }

  if (DEF.fn) {
    for (const key in DEF.fn) {
      if (typeof DEF.fn[key] === 'function') {
        fsmContext.fn[key] = (...args: any[]) => DEF.fn[key](fsmContext, ...args)
      }
    }
  }

  const machine = {
    trigger(str: string) {
      const match = str.match(/^(?<event>\w+)(?:\((?<param>[^)]+)\))?$/);
      if (!match || !match.groups) return;
      
      const { event, param } = match.groups
      
      const currentStateName = ctx.get(stateKey) as string
      const currentState = DEF.states[currentStateName]
      if (!currentState) return;
      
      const targetState = currentState[event];
      let newState = '';

      switch (typeof targetState) {
        case 'string':
          newState = targetState;
          break;
        case 'function':
          const returned = targetState(fsmContext, param)
          if (returned !== undefined) { newState = returned }
          break
      }
      if (DEF.states[newState]) { // check if newState is valid
        if (currentState.onExit){
          currentState.onExit(fsmContext, param)
        }
        ctx.set(stateKey, newState)
        if (DEF.states[newState].onEnter){
          DEF.states[newState].onEnter(fsmContext, param)
        }
      }
      else if (newState !== ''){
        console.warn(`❗Invalid attempt for newState "${newState}" in current "${currentStateName}"`)
      }
    },
    getState() { 
      return ctx.get(stateKey) as string;
    },
    getTriggers() { 
      const currentStateName = ctx.get(stateKey) as string;
      return Object.keys(DEF.states[currentStateName] || {}); 
    },
    getSnapshot(): MachineSnapshot {
      return {
        meta: { ...DEF.meta, snapped: Date.now() },
        ctx: ctx.getSnapshot()
      };
    }
  };

  fsmContext.machine = machine;

  return { machine, ctx }
}

// use getSnapshot() output with matching definition to start a new machine from the saved state
export function resumeMachine(
  definition: any, // source 
  snapshot: MachineSnapshot, // merging in
  ifFailDefinitionFallback: boolean = true // use definition context defaults if snapshot versions do not match
){
  if (
    definition.meta.id === snapshot.meta.id && 
    definition.meta.ver === snapshot.meta.ver
  ) {
    let mergedDef = definition
    mergedDef.ctx = [...snapshot.ctx]
    mergedDef.meta = {...definition.meta, ...snapshot.meta}    

    return createMachine(mergedDef)
  } else {
    if (ifFailDefinitionFallback){
      // Mismatch fallback
      definition.meta.err = `${snapshot.meta.snapped} update failed`
      console.warn(`${snapshot.meta.snapped} snapshot merge failed (id or version mismatch).\nFallback to definition ${definition.meta.id} ver ${definition.meta.ver}.`)
    } else {
      console.warn(`${snapshot.meta.snapped} snapshot merge FAILED (id or version mismatch).`)
      return null 
    }

    return createMachine(definition)
  }
}
