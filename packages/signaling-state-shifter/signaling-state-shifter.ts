// v2.0.20260227 @2026 TomByrer 
// FSM with functions and alien-signals
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
      const reParam = /^(?<name>\w+)(?:\((?<param>[^)]*)\))?$/;
      const match = str.match(reParam)
      if (!match?.groups) return
      const { name:event, param:triggerParam } = match.groups

      const currentStateName = ctx.get(stateKey) as string
      const currentState = DEF.states[currentStateName]
      if (!currentState) return;
      
      const targetState = currentState[event];
      let newState = '';

      switch (typeof targetState) {
        case 'string':
          const targetMatch = targetState.match(reParam)
          console.log('str', targetMatch?.groups)
          if (!targetMatch?.groups) {
            throw new Error('Invalid targetState format');
          }
          let { name, param } = targetMatch?.groups
          switch (param) {
            case undefined: // targetState === 'plain string' (no parentheses)
              newState = name;
              break;
            case '': // targetState === 'emptyFn()' (empty parentheses)
  {           const returned = DEF.fn[name]()
            if (returned !== undefined) { newState = returned }
            break;}
            default: // targetState === 'fnParam("test")' (has content)
              param = (param === "param") ? triggerParam : param
  {           const returned = DEF.fn[name](param)
              if (returned !== undefined) { newState = returned }
              break;}
          }
            break;
        case 'function':
          const returned = targetState(fsmContext, triggerParam)
          if (returned !== undefined) { newState = returned }
          break
      }
      if (DEF.states[newState]) { // check if newState is valid
        if (currentState.onExit){
          currentState.onExit(fsmContext, triggerParam)
        }
        ctx.set(stateKey, newState)
        if (DEF.states[newState].onEnter){
          DEF.states[newState].onEnter(fsmContext, triggerParam)
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
