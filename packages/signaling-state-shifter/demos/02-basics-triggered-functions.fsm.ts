import createMachine from '../signaling-state-shifter'

// DEMO CODE

// NOT best practice to put 'context' outside of FSM,
// but sometimes needed when interacting with external data
const data = {
  count: 0,
}
// helpers / external function calls
function externalLog(str='default log'){
  console.log(str)
}
function subtract(num=0){
  data.count -= num
}

// FSM functions
const fn = {
  // _ = unused ctx placeholder
  print: (_, str = 'default print')=>{
    console.log(str)
  },
  add1: ()=>{
    data.count++
    externalLog(`🧮 count+1 = ${data.count}`) 
  },
  addNumber: (_, text: string)=>{
    data.count += Number(text)
    externalLog(`🧮 count+x = ${data.count}`) 
  },
  subtractNumber: (_, text: string)=>{
    subtract(Number(text))
    externalLog(`🧮 count-x = ${data.count}`) 
  },
  nextGuard: ()=>{
    if (data.count >= 10) {
      return 'fini'
    } else {
      externalLog(`count needs to be 10+, which is now only ${data.count}`)
    }
  }
}
// FSM
const states = {
  start: {
    next: 'middle',
    finish: 'fini',
  },
  middle: {
    // These already work as string references:
    callNoPram: 'print()',
    info: `print('Hello from middle:info, no trigger')`,
    // Change from inline function to string reference
    add1: 'add1()',           // was: ()=>{ ... }
    addNumber: 'addNumber()',    // will receive param via addNumber("5")
    subtractNumber: 'subtractNumber()',
    nextGuard: 'nextGuard()',
  },
  fini: {
    restart: 'start',
  },
}

const {machine} = createMachine( { meta:{id:'maths',ver:'1.0.260307'}, fn, states} )
/*^ end FSM */
console.log('machine: ', machine,)

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
  logTrigger('callNoPram', `print 'default log', noop; should stay in middle`)
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
  logTrigger('finish', `start --> fini`)
  // state: end
}
runDemo()
/*^ end demo */
