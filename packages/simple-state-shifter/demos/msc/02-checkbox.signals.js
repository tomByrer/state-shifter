// emulate HTML checkbox, using alien-signals as global state
import createMachine from '../../simple-state-shifter'
import SignalMapish from 'alien-signals-mapish'

const presets = [
  ['state', ''], // FSM main state
  // contexts are below
  ['isNew', true], // is just now initialized? 
  ['isTrue', null], // when init, should be true or false after
  ['isDisabled', null], // when init, should be true or false after
]
const data = new SignalMapish(presets)

// Finite State Machine (FSM)
const states ={
  // first 'state' is always the initial/default
  init: {
    assignFalse: 'false',
    assignFalseDisabled: 'falseDisabled',
    assignTrue: 'true',
    assignTrueDisabled: 'trueDisabled',
  },
  false: {
    toggle: 'true', // UI click usually
    assignTrue: 'true', // programmatically, switch label
    disable: 'falseDisabled'
  },
  falseDisabled: {
    enable: 'false',
    assignTrue: 'trueDisabled'
  },
  true: {
    toggle: 'false', // UI click usually
    assignFalse: 'false', // programmatically, switch label
    disable: 'trueDisabled'
  },
  trueDisabled: {
    enable: 'true',
    assignFalse: 'falseDisabled'
  },
}
const machine = createMachine(states, data)
console.log(`'machine' started using simple-state-shifter & alien-signals-mapish:`)

// set up all data.effect after machine
let hasAttributeChecked = false;  // demo of HTML state
let hasAttributeDisabled = false; // demo of HTML state
data.effect(() => { // trace all changes to state
  console.info( 'pre state:', data.get('state') )
  console.info( 'isNew:', data.get('isNew') )
  // emulating 'onEnter' function for the first state
  if (data.get('isNew')){
    data.set('isNew', false)
    let assign = 'assign' 
    assign += (hasAttributeChecked) ? 'True' : 'False';
    assign += (hasAttributeDisabled) ? 'Disabled' : '';
console.warn('init assign:', assign)
    machine.trigger(assign)
  }
  console.info( 'post state:', data.get('state') )
});
/*^ end finite state machine */

/*^ begin demo tests*/
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

async function runDemo() {
  logTrigger('nothing', `noop; should be in standby`)
  await wait(99)
  logTrigger('toggle', `...`)
  await wait(99)
  logTrigger('fake', `red -> green`)
  await wait(99)
  logTrigger('disable', `noop; should send 'next'`)
  await wait(99)
  logTrigger('fake', `green -> yellow`)
  await wait(99)
  logTrigger('assignFalse', `yellow -> red`)
  await wait(99)
  logTrigger('enable', `red -> green`)
}
runDemo()
/*^ end demo */
