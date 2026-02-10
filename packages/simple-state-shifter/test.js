/* 01-simple-trafficlight v1.0.0*/
import createMachine from '../../simple-state-shifter'
// use const if you don't plan on editing the states
let states ={
  // first 'state' is always the initial/default
  red: {
    next: 'green',
    
  },
  green: {
    next: 'yellow',
  },
  yellow: {
    next: 'red',
  },
}
// by convention, the instantiated FSM is named 'machine',
// but if you have several FSM, then pick a more prescriptive name, like "fsmTrafficLights" 
let machine = createMachine(states)

console.info(`current state-trigger listing:
{
  // first 'state' is always the initial/default
  red: {
    next: 'green',
  },
  green: {
    next: 'yellow',
  },
  yellow: {
    next: 'red',
  },
}
`)

console.log('(current state ~ [ available trigger(s) ])')
console.log(`machine.getState():`,machine.getState(), '~', `machine.getTriggers():`, machine.getTriggers())
console.log(`(machine.trigger('next') will return 'undefined' since SSS doesn't return anything)`)
console.log(`machine.trigger('next')`,machine.trigger('next'))
console.log(machine.getState(), '~', machine.getTriggers())
console.log(`machine.trigger('next')`,machine.trigger('next'))
console.log(machine.getState(), '~', machine.getTriggers())
console.log(`machine.trigger('next')`,machine.trigger('next'))
console.log(machine.getState(), '~', machine.getTriggers())
console.log(`machine.trigger('green') [should not trigger]`,machine.trigger('green'))
console.log(machine.getState(), '~', machine.getTriggers())
console.log(`machine.trigger('error') * hoping to get an 'outage' state`,machine.trigger('error'))
console.log(machine.getState(), '~', machine.getTriggers())
console.error(`failed: that trigger & target state don't exist...`)
console.log(`
...so we'll add them to our 'states' object:

states = { outage:{fix: 'red'}, ...states}
states.red = {...states.red, error: 'outage'}
states.green = {...states.green, error: 'outage'}
states.yellow = {...states.yellow, error: 'outage'}
console.dir(states)`)
states = { outage:{fix: 'red'}, ...states}
states.red = {...states.red, error: 'outage'}
states.green = {...states.green, error: 'outage'}
states.yellow = {...states.yellow, error: 'outage'}
console.dir(states)

console.log(`machine.trigger('error') * hoping to get an 'outage' state`,machine.trigger('error'))
console.log(machine.getState(), '~', machine.getTriggers())
console.error(`failed: current machine still has old states...`)
console.log(`
...so we'll 'reboot' the machine:

machine = createMachine(states)
...the initial state should be 'outage'
console.log(machine.getState(), '~', machine.getTriggers())
`)
machine = createMachine(states)
console.log(machine.getState(), '~', machine.getTriggers())

console.log(`machine.trigger('next') should be ignored...`,machine.trigger('next'))
console.log(machine.getState(), '~', machine.getTriggers())
console.log(`...because we have to: machine.trigger('fix')`,machine.trigger('fix'))
console.log(machine.getState(), '~', machine.getTriggers())

// console.log(machine.data)
console.log(machine.stateId)
// machine.data.set('ctxCount',2)
// // machine.data.context = {ran:2}
// console.log(machine.data)