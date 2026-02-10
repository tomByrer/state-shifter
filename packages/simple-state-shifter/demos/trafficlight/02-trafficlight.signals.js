import createMachine from '../../simple-state-shifter'
import SignalMapish from 'alien-signals-mapish'

const presets = [
  ['state', ''], // FSM main state
  // ['isBlinking', false],  // 'broken', after lights reset & are 4-way blinking
]
const data = new SignalMapish(presets)
data.effect(() => { // trace all changes to state
  console.info( '📝 state:', data.get('state') )
});

// Finite State Machine (FSM)
const states ={
  // first 'state' is always the initial/default
  allwaystop: { // 4-way flashing red lights
    reset: 'red', // don't use 'next'; simulates manual fix
  },
  red: {
    next: 'green',
    error: 'allwaystop',
  },
  green: {
    next: 'yellow',
    error: 'allwaystop',
  },
  yellow: {
    next: 'red',
    error: 'allwaystop',
  },
}
const machine = createMachine(states, data)
/*^ end finite state machine */

/*^ begin demo tests*/
console.log(`'machine' init using simple-state-shifter:`)

const wait = (ms) => new Promise(res => setTimeout(res, ms))
function currentStatus(){
  console.log(`  state >`, machine.getState(),
    `< with triggers:`, machine.getTriggers())
}
function logTrigger(trigger, note){
  console.log(`
machine.trigger('${trigger}') // ${note}
`)
  machine.trigger(trigger)
  currentStatus()
}
currentStatus()

console.error(`
BTW, real traffic lights do not run this fast.  The pause is shorter for demo.`)
async function runDemo() {
  logTrigger('next', `noop; should be in allwaystop`)
  await wait(1111)
  logTrigger('reset', `allwaystop -> red`)
  await wait(1111)
  logTrigger('next', `red -> green`)
  await wait(1111)
  logTrigger('yellow', `noop; should send 'next'`)
  await wait(1111)
  logTrigger('next', `green -> yellow`)
  await wait(1111)
  logTrigger('next', `yellow -> red`)
  await wait(1111)
  logTrigger('next', `red -> green`) 
  await wait(1111)
  logTrigger('error', `green -> allwaystop`)
}
runDemo()
/*^ end demo */
