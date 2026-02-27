// basics simple-state-shifter FSM
import createMachine from '../../simple-state-shifter'
import SignalMapish from 'alien-signals-mapish'

// signal data
const presets = [
  ['state', ''], // FSM main state
  // contexts are below, so now instead of `context.count` we'll `data.count`
  ['count', 0],
  ['usedCount', 0], // flagged when count has been touched
]
const data = new SignalMapish(presets)
// console.log(data)

// helpers
export function print(str='default log'){
  console.log(str)
}

// functions for states
function addCount(input){
  data.set('count', data.get('count') + input)
  data.set('usedCount', data.get('usedCount') + 1) // logging count usage
}

data.effect(() => {
  print(`🧮 count is now: ${data.get('count')} usedCount: ${data.get('usedCount')}`)
})

// guards & branches
function guardTry(){
  if (data.get('usedCount') > 0){
    console.warn('guardBY used')
    return 'end'
  }
  else {
    print(`👀 Select [next] to try out the new counter system please.
`)
  }
}

// FSM
const states ={
  // first 'state' is always the initial/default
  start: {
    next: 'middle',

    // guard to check if played with count in middle;
    // make sure use `return` keyword to pass on the trigger if any
    finish: ()=>{ return guardTry() } // guard example
  },
  middle: {
    // function inside event, but no trigger to next state
    info: ()=>{ print('Functions to change count') },

    // inline function
    add1: ()=>{ addCount(1) },

    // external function with parameter, but note that only single text parameter are passed, so you need to workaround if you need something different
    addNumber: (text)=>{ addCount(Number(text)) },
    subtractNumber: (text)=>{ addCount(-Number(text)) },
    next: ()=>{ return guardTry() },
    finish: ()=>{ return guardTry() } // sometimes best to repeat triggers from elsewhere to keep API constancy
  },
  end: {
    restart: 'start',
  },
}

const machine = createMachine(states, data)
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
  logTrigger('finish', `guard; can't end unless use counter`)
  logTrigger('next', `start --> middle`)
  // state: middle
  logTrigger('info', `noop; should stay in middle`)
  logTrigger('next', `guard; can't end unless use counter`)
  logTrigger('add1', `+ 1 to count, inc counter counter`)
  // two examples of a triggers that pass parameters
  logTrigger('addNumber(5)', `+5 with parameter`)
  logTrigger('subtractNumber(1)', `-1 with parameter`)
  logTrigger('next', `middle --> end`)
  // state: end
  logTrigger('next', `doesn't exist; should be in end`)
  logTrigger('restart', `end --> start`)
  // state: start
  logTrigger('finish', `start --> end`)
}
runDemo()
/*^ end demo */