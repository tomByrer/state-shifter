/* v1.1.0 simple-state-shifter (C)2025-2026 Tom Byrer, rights reserved, but ask me about OSS License */
export default function createMachine(
  definition, // state-transition object
  data=new Map([['state','']]), // allow external state & context storage, must have get(key) & set(key, value) methods
  // for now, data must always hold a key of 'state'
  // stateId='state' // in case you want to run mulitple machines in same data
){
  // init
  // initial state must be first place in the `data` object
  data.set( 'state', Object.keys(definition)[0] )

  const machine = {
    trigger(str){ // AKA 'event'
      // allows `event(param)` being passed as a string, not a function call
      const { event, param } = str.match(/^(?<event>\w+)(?:\((?<param>[^)]+)\))?$/).groups
      const currentState =  definition[ data.get('state') ]
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
        data.set('state', newState)
      }
      // no return; the data-state has your result, if you need it right away then use a signal library for `data`
    },
  }

  // return current FSM state
  machine.getState = function(){ return data.get('state') }
  // return available 'trigger' words for the current FSM state
  machine.getTriggers = function(){ return Object.keys( definition[ data.get('state') ]) }

  return machine
}
