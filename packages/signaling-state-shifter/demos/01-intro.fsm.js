// basics simple-state-shifter FSM
import createMachine from '../signaling-state-shifter'

// FSM
const states ={
  // first 'state' is always the initial/default
  start: {
    next: 'middle',
    finish: 'end',
  },
  middle: {
    info: '', // if noop, just make the value/'event' to be an empty string
    next: 'end',
  },
  end: {
    restart: 'start',
  },
}

const {machine} = createMachine( { meta:{id:'intro',ver:'1.0.260226'},states:states} )
/*^ end finite state machine */

/*^ begin demo tests*/
function currentStatus(){
  console.log(`  state >`, machine.getState(),
    `<
with triggers:`, machine.getTriggers()
  )
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
  logTrigger('info', `doesn't exist; should be in start`)
  logTrigger('next', `start --> middle`)
  // state: middle
  logTrigger('info', `noop; should stay in middle`)
  logTrigger('next', `middle --> end`)
  // state: end
  logTrigger('next', `doesn't exist; should be in end`)
  logTrigger('restart', `end --> start`)
  // state: start
  logTrigger('finish', `start --> end`)
  // state: end
}
runDemo()
/*^ end demo */
