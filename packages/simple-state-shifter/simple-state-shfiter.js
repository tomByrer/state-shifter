/* v0.5.0 simple-state-shifter (C)2025 Tom Byrer, rights reserved, but ask me about OSS License */
export default function createMachine(definition, data, id=definition._.id){
  const machine = {
    stateId: id+'-state',
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
      // no return; the *-state has your result, if you need it right away then use a signal library for `data`
    },
  }
  data.set(machine.stateId, Object.keys(definition)[1]) // init

  return machine
}
