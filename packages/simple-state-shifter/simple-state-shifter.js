/* v0.7.0 simple-state-shifter (C)2025 Tom Byrer, rights reserved, but ask me about OSS License */
export default function createMachine(
  definition, // state-transition object
  data=new Map([['state','']]), // allow external state & context storage, must have get(key) & set(key, value) methods
  id=definition?._?.id // in case you want to run mulitple machines in same data
){
  const machine = {
    stateId: (id) ? id+'-state' : 'state',
    data: data,
    trigger(event, param){
      const currentState =  definition[ data.get(machine.stateId) ]
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
        data.set(machine.stateId, newState)
        definition[ data.get(machine.stateId) ]?._?.fnEnter?.() // does not re-turn if not enter3ed from outside state.
      }
      // no return; the data-state has your result, if you need it right away then use a signal library for `data`
    },
  }
  // init
  data.set( machine.stateId, Object.keys(definition)[ (id) ? 1 : 0 ] ) // if id proved, then inital state must be 2nd
  // return current
  machine.getState = function(){ return data.get(machine.stateId) }
  machine.getTriggers = function(){ return Object.keys( definition[ data.get(machine.stateId) ]) }

  return machine
}
