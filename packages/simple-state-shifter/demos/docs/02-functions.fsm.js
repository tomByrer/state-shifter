// using simple-state-shifter FSM with functions
import createMachine from '../../simple-state-shifter'

// helpers
export function print(str='default log'){
  console.log(str)
}
const context = {
  count: 0,
}
function subtract(num=0){
  context.count -= num
}

// FSM
const states ={
  // first 'state' is always the initial/default
  start: {
    next: 'middle',
    finish: 'end',
  },
  middle: {
    // function inside event, but no trigger to next state
    info: ()=>{ print('Hello from middle:info, no trigger') },

    // inline function
    add1: ()=>{ context.count++;print(`🧮 count+1 = ${context.count}`) },

    // inline function with parameter, but note that only single text parameter are passed, so you need to workaround if you need something different
    addNumber: (text)=>{ context.count += Number(text);print(`🧮 count+x = ${context.count}`) },

    // external function call with parameter
    subtractNumber: (text)=>{ subtract(Number(text));print(`🧮 count-x = ${context.count}`) },
    nextGuard: ()=>{ // guard example
      if (context.count >=10){
        return 'end'
      }
      else {
        print(`count needs to be 10+, which is now only ${context.count}`)
      }
    }
  },
  end: {
    restart: 'start',
  },
}

const machine = createMachine(states)
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
machine.trigger('${trigger}') // ${note}`)
  machine.trigger(trigger)
  currentStatus()
}
currentStatus()

async function runDemo() {
  logTrigger('info', `doesn't exist; should be in start`)
  logTrigger('next', `start --> middle`)
  // state: middle
  logTrigger('info', `print, noop; should stay in middle`)
  logTrigger('add1', `+1 inline function`)
  // two examples of a triggers that pass parameters
  logTrigger('addNumber(5)', `+5 with parameter`)
  logTrigger('subtractNumber(1)', `-1 outside function`)
  
  logTrigger('nextGuard', `failed guard check`)
  logTrigger('addNumber(10)', `+10 with parameter`)
  logTrigger('nextGuard', `succeed guard check`)
  // state: end
  logTrigger('next', `doesn't exist; should be in end`)
  logTrigger('restart', `end --> start`)
  // state: start
  logTrigger('finish', `start --> end`)
  // state: end
}
runDemo()
/*^ end demo */
