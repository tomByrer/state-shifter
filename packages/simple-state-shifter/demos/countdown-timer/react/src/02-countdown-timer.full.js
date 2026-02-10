/* countdown-timer v01.04 (c) 2025 Tom Byrer */
/* https://www.mermaidchart.com/play#pako:eNp9kDEOwjAMRa9idUTKBTwwMTKxUgbTuG1E66DUFVSIu9OEIkWgMsV53_4_zqOovOUCC2NMKZWX2jVYCoC23DNC7QMPGkHn_QWhJbG7QDdJiCY_KoKlJnApyWJQUt65mVAfe6wLXKnzAvtDvB83JzBmCwOrOmkiWsqEwygSa4TZKKTgD8qm0HLHyt8qdRR65PvVhR_tSuPAFtPx46rzVucJ51U5Rb6bVxJz8c_gEhC1sU-D6Xkrppn27bmAlcFc_UQuX1c8X7eipW4
stateDiagram
  [*] --> setting
  setting --> running:start
  running --> setting:delete
  running --> alarm:expire
  running --> paused:pause
  running --> standby:reset
  paused --> setting:delete
  paused --> reset:standby
  paused --> running:resume
  alarm --> setting:delete
  alarm --> standby:reset
  standby --> setting:delete
  standby --> running:start
*/
import * as AS from 'alien-signals'
import createMachine from './simple-state-shifter'

export const presets = [
  ['state', ''],
  ['defaultSeconds', 5],  // fallback when deleted, set > 0 for demp/testing
  ['inputSeconds', 0],  // user/UI input time for reset
  ['intervalID', ''],
  ['remainingSeconds', 99], // same as duration
]
export function createSignalStore(presets) {
  const store = {}
  const len = presets.length
  for (let i = 0; i < len; i++){
    const [key, value] = presets[i]
    store[key] = AS.signal(value)
  }

  function effect(fn) {
    AS.effect(fn)
  }

  function get(key = 'state') {
    return store[key]() // Returns undefined if the key doesn't exist
  }

  function set(key, value) {
    store[key](value)
  }

  return {
    store,
    effect,
    get,
    set,
  }
}
export const data = new createSignalStore(presets)

// helper
export function log(str='default log'){
  console.log(str)
}

const FN ={
  delete: function(){ // resets time back to default
    data.set('inputSeconds', data.get('defaultSeconds'))
    data.set('remainingSeconds', data.get('defaultSeconds'))
    log(`DELETEd`)
  },
  expire: function(){
    // this.stop() //TODO? cleanup
    log(`EXPIREd, alarm sound`)
  },
  pause: function(){
    clearInterval(data.get('intervalID'))
    data.set('intervalID', '')
    log(`PAUSEd at ${data.get('remainingSeconds')} sec`)
  },
  reset: function(){ // resets time back to last set time from start
    data.set( 'remainingSeconds', data.get('inputSeconds') )
    log(`RESET countdown back to ${data.get('remainingSeconds')} sec`)
  },
  resume: function(){
    log(`RESUME countdown at ${data.get('remainingSeconds')} sec`)
    const intID = setInterval(() => {
      const remaining = data.get('remainingSeconds') - 1
      data.set('remainingSeconds', remaining)
      if (remaining <= 0) {
        machine.trigger('expire')
      }
    }, 1000)
    
    data.set( 'intervalID', intID )
  },
  start: function(sec=data.get('inputSeconds')){
    data.set('inputSeconds', sec)
    data.set('remainingSeconds', sec)
    log(`START timer ${data.get('inputSeconds')} sec`)
    // we are not actually 'resuming', but let's streamline conserns
    this.reset()
    this.resume()
  },
}

export const states ={
  setting: {  // 1st screen, no timer set
    start: (sec)=>{
      sec ||= data.get('remainingSeconds')
      if (sec > 0){
        FN.start(sec)
        return 'running'
      }},
  },
  running: {
    delete: ()=>{FN.pause();FN.delete();return 'setting'},
    expire: ()=>{FN.pause();return 'alarm'}, // countdown reached 0
    pause: ()=>{FN.pause();return 'paused'}, // stop countdown, current value is on hold
    reset: ()=>{FN.pause();FN.reset();return 'standby'}, // stop countdown, return to after the time is set
  },
  paused: {
    delete: ()=>{FN.delete();return 'setting'},
    reset: ()=>{FN.reset();return 'standby'},
    resume: ()=>{FN.resume();return 'running'},
  },
  alarm: {
    delete: ()=>{FN.delete();return 'setting'},
    reset: ()=>{FN.reset();return 'standby'},// note pause = stop
  },
  standby: { // timer reset, awaiting to start
    delete: ()=>{FN.delete();return 'setting'},
    start: ()=>{FN.start();return 'running'},
  },
}
export const machine = createMachine(states, data)
/*^ end finite state machine */

// automatically run demostration
// import { machineSequence } from './utils'
// console.log(`Running simple-state-shifter version of countdown-timer,
// output should equal 'plain' JS version:`)

// machineSequence(
//   machine, machine.data,
//   [
//     'reset', // noop; should be in setting already
//     'start', // setting -> running
//     'wait(1)',
//     'pause', // running -> paused
//     'wait(1)',
//     'resume', // paused -> running
//     'wait(6)',
//     // 'expire', // running -> alarm
//     'reset', // alarm -> standby
//     'start', // standby -> running
//     // 'reset', // running -> stanby
//     'wait(3)',
//     'delete', // stanby -> setting
//   ],
//   'remainingSeconds', // watch/effect
// )
