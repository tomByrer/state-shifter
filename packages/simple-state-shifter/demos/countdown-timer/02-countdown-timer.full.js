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
import createMachine from '../../simple-state-shifter'
import SignalMapish from 'alien-signals-mapish'

export const presets = [
  ['state', ''],
  ['defaultSeconds', 5],  // usually 0, but for Pomodro
  ['intervalID', ''],
  ['remainingSeconds', 0], // same as duration
]
/*

* state
* effect(() => {
*   console.log(`State is: ${count.get('state)}`);
* }); // Console: State is: 1
*/

export const data = new SignalMapish(presets)
// console.log('AS store:', data.store)

const res = data.get('nothere')
console.log(`data.get('nothere')`, res) // should return undefined

// helper
export function log(str='default log'){
  console.log(str)
}

data.effect(() => {
  console.log( '⏰ ', data.get('remainingSeconds') );
}); // Console: Count is: 1


// as a convenance / convention, put all FuNctions for the FSM into an object
const FN ={
  delete: function(){ // resets time back to default
    // data.set('defaultSeconds', 0)
    data.set('remainingSeconds', 0)
    log(`ran DELETEd`)
  },
  expire: function(){
    // this.stop() //TODO? cleanup
    log(`ran EXPIREd, alarm sound`)
  },
  pause: function(){
    clearInterval(data.get('intervalID'))
    data.set('intervalID', '')
    log(`ran PAUSEd at ${data.get('remainingSeconds')} sec`)
  },
  reset: function(){ // resets time back to last set time from start
    data.set( 'remainingSeconds', data.get('defaultSeconds') )
    log(`ran RESET countdown back to ${data.get('remainingSeconds')} sec`)
  },
  resume: function(){
    log(`ran RESUME countdown at ${data.get('remainingSeconds')} sec`)
    const intID = setInterval(() => {
      const remaining = data.get('remainingSeconds') - 1
      data.set('remainingSeconds', remaining)
      if (remaining <= 0) {
        machine.trigger('expire')
      }
    }, 1000);
    
    data.set( 'intervalID', intID )
  },
  start: function(sec=data.get('defaultSeconds')){
    data.set('defaultSeconds', sec)
    data.set('remainingSeconds', sec)
    log(`ran START timer ${data.get('defaultSeconds')} sec`)
    // we are not actually 'resuming', but let's streamline concerns
    this.reset()
    this.resume()
  },
}

export const states ={
  setting: {  // 1st screen, no timer set
    start: (sec)=>{
      sec ||= data.get('defaultSeconds')
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


/*^ begin demo tests */
console.log(`'machine' init using simple-state-shifter:`)

const wait = (ms) => new Promise(res => setTimeout(res, ms))
function currentStatus(){
  console.log(`  state >`, machine.getState(),
    `< with triggers:`, machine.getTriggers())
}
function logTrigger(trigger, note){
  console.log(`💻machine.trigger('${trigger}') // ${note}`)
  machine.trigger(trigger)
  currentStatus()
}
currentStatus()
async function runDemo() {
  logTrigger('reset', `noop; should be in setting already`)
  logTrigger('start(6)', `setting -> running`)
  await wait(2200)
  logTrigger('pause', `running -> paused`) 
  await wait(2000)
  logTrigger('start', `noop; should send 'resume'`)
  await wait(2200)
  logTrigger('resume')
  await wait(6200)
  logTrigger('start', `still in alarm, so noop`) 
  await wait(3200)
  logTrigger('reset', `alarm -> standby`) 
  logTrigger('start', `standby -> running`) 
  await wait(2200)
  logTrigger('delete', `running -> setting`) 
}
runDemo()
/*^ end demo */
