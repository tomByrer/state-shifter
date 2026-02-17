// before simple-state-shifter FSM

const data = new Map([['state', '']])
// FSM using only switch/case without simple-state-shifter
class FiniteStateMachine {
  constructor() {
    data.set('state', 'start') // initial state
  }

  trigger(event){
    switch (data.get('state')) {

      case 'start':
        switch (event){
          case 'next':
            data.set('state', 'middle');
            break;
          case 'finish':
            data.set('state', 'end');
            break;
        }break;

      case 'middle':
        switch (event){
          case 'info':
            /* noop */
            break;
          case 'next':
            data.set('state', 'end');
            break;
        }break;

      case 'end':
        switch (event){
          case 'restart':
            data.set('state', 'start');
            break;
        }break;
    }
  }//trigger

  getState(){
    return data.get('state')
  }
}
const machine = new FiniteStateMachine()
/*^ end finite state machine */

/*^ begin demo tests*/
function currentStatus(){
  console.log(`  state >`, machine.getState(),`<`
  // getting a list of trigger won't be possible without more complicated programming
// with triggers:`, machine.getTriggers()
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
