import createMachine from '../signaling-state-shifter'

// DEMO CODE

// helper
export function print(str='default log'){
  console.log(str)
}
// NOT best pratise: we'll fake an external context/ctx
const context = {
  count: 0,
}
// external fn for states
function subtract(num=0){
  context.count -= num
}

const fn = {
  print: (str = 'default log') => {
    console.log(str)
  },
  // Move add1 here
  add1: () => { 
    context.count++
    print(`🧮 count+1 = ${context.count}`) 
  },
  // Move other inline functions too
  addNumber: (text: string) => { 
    context.count += Number(text)
    print(`🧮 count+x = ${context.count}`) 
  },
  subtractNumber: (text: string) => { 
    subtract(Number(text))
    print(`🧮 count-x = ${context.count}`) 
  },
  nextGuard: () => { 
    if (context.count >= 10) {
      return 'end'
    } else {
      print(`count needs to be 10+, which is now only ${context.count}`)
    }
  }
}

// FSM
const states = {
  start: {
    next: 'middle',
    finish: 'end',
  },
  middle: {
    // Change from inline function to string reference
    add1: 'add1()',           // was: ()=>{ ... }
    addNumber: 'addNumber(param)',    // will receive param via addNumber("5")
    subtractNumber: 'subtractNumber(param)',
    nextGuard: 'nextGuard()',
    
    // These already work as string references:
    callNoPram: 'print()',
    info: `print('Hello from middle:info, no trigger')`,
  },
  end: {
    restart: 'start',
  },
}

const {machine} = createMachine( { meta:{id:'maths',ver:'1.0.260226'},fn:fn,states:states} )
console.log('machine', machine,)
/*^ end finite state machine */

/*^ begin demo tests*/
function currentStatus(){
  console.log(`  state >`, machine.getState(),`<`
// with triggers:`, machine.getTriggers()
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
  logTrigger('callNoPram', `print default, noop; should stay in middle`)
  logTrigger('info', `print, noop; should stay in middle`)
  logTrigger('add1', `+1 inline function`)
  // two examples of a triggers that pass parameters
  logTrigger('addNumber(5)', `+5 with parameter`)
  logTrigger('subtractNumber(1)', `-1 outside function`)
  
  // logTrigger('nextGuard', `failed guard check`)
  // logTrigger('addNumber(10)', `+10 with parameter`)
  // logTrigger('nextGuard', `succeed guard check`)
  // // state: end
  // logTrigger('next', `doesn't exist; should be in end`)
  // logTrigger('restart', `end --> start`)
  // // state: start
  // logTrigger('finish', `start --> end`)
  // state: end
}
runDemo()
/*^ end demo */
