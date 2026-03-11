// signaling-state-shifter v2.1.260311 @2026 TomByrer
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
export default function createMachine(
  DEF: any,
  stateKey: string =  DEF.meta.id + 'State',
  merge: any = false, // pass the Map (or Mapish) you want to merge
){
  const ctx: any = createMaps(DEF, stateKey, merge)
  const fsmFn: Record<string, any> = {}
  if (DEF.fn) {
    for (const key in DEF.fn) {
      if (typeof DEF.fn[key] === 'function') {
        fsmFn[key] = (...args: any[]) => DEF.fn[key](ctx, ...args)  //FIXME xtx & fn
      }
    }
  }

  function funcTarget(targetState: string, param: string){ // returns newStateName
    const matchTarget = targetState.match(/^(?<targetName>\w+)(?:\((?<targetParam>.*)\))?$/)
    if (!matchTarget){
      console.warn(`❗Malformed target`) // usually invalid character, but we don't want to log targetState; might be exploit
      return //nothing
    }
    const { targetName, targetParam } = matchTarget.groups
    switch (targetParam){

      case undefined: // no function
        return targetState
        break;

      case '': // function, no parameters
        return fsmFn[targetName](param)
        break;
        
      default: // has targetParam
        // Strip quotes if present
        let processedParam = targetParam
          .replace(/^['"`](.*)['"`]$/, '$1') // remove outer quotes
          .replaceAll('$param', param) // replace from trigger parameter
        return fsmFn[targetName](processedParam)  // FIXED
        break;
    }//switch
  };

  const machine = {
    trigger(str: string) {
      const match = str.match(/^(?<event>\w+)(?:\((?<param>.*)\))?$/)
      if (!match || !match.groups) return;
      
      const { event, param } = match.groups
      
      const currentStateName = ctx.get(stateKey) as string
      const currentState = DEF.states[currentStateName]
      if (!currentState) return
      const targetState = currentState[event]
      if (!targetState){
        console.warn(`❗Invalid trigger/target "${event}" in current "${currentStateName}"`)
        return //nothing
      }

      const newStateName = funcTarget(targetState, param)
      if (newStateName === undefined) return;  // noop; likely "targetless transition"
      if (newStateName === currentStateName){  // don't allow reentry triggers
        console.warn(`❗Prevented attempt to retrigger "${currentStateName}"`)
        return
      }
      const newStateObj = DEF.states[newStateName]
      if (!newStateObj){ // check if newStateName is valid
        console.warn(`❗Invalid attempt for newState "${newStateName}" in current "${currentStateName}"`)
        return
      }
      // transition state
      if (currentState.onExit){
        funcTarget(currentState.onExit, param)
      }
      ctx.set(stateKey, newStateName)
      if (newStateObj.onEnter){
        funcTarget(newStateObj.onEnter, param)
      }
    },
    getState() { 
      return ctx.get(stateKey) as string
    },
    getTriggers() { 
      const currentStateName = ctx.get(stateKey) as string
      return Object.keys(DEF.states[currentStateName] || {})
    },
    getSnapshot(): MachineSnapshot {
      return {
        meta: { ...DEF.meta, snapped: Date.now() },
        ctx: ctx.getSnapshot()
      }
    }
  };
  return { machine, ctx }
}

// use getSnapshot() output with matching definition to start a new machine from the saved state
export function resumeMachine(
  definition: any, // source 
  snapshot: MachineSnapshot, // merging in
  ifFailDefinitionFallback: boolean = false // use definition context defaults if snapshot versions do not match
){
  // happy-path
  if (
    definition.meta.id === snapshot.meta.id && 
    definition.meta.ver === snapshot.meta.ver
  ) {
    let mergedDef = definition
    mergedDef.ctx = [...snapshot.ctx]
    mergedDef.meta = {...definition.meta, ...snapshot.meta}    
    return createMachine(mergedDef)
  }

  if (!ifFailDefinitionFallback){
    throw new Error(`${snapshot.meta.snapped} snapshot merge hard FAILED (id or version mismatch).`)
  }
  // Mismatch fallback to restart machine with defaults
  definition.meta.err = `${snapshot.meta.snapped} update failed`
  console.warn(`${snapshot.meta.snapped} snapshot merge failed (id or version mismatch).\nFallback to definition ${definition.meta.id} ver ${definition.meta.ver}.`)
  return createMachine(definition)
}
