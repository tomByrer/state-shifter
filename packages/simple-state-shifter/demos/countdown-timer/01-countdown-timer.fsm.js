/* countdown-timer v01.03 (c) 2025 Tom Byrer */
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
  alarm --> standby:stop
  standby --> setting:delete
  standby --> running:start
*/
import createMachine from 'simple-state-shifter'

export const states ={
  setting: {  // 1st screen, no timer set
    start: 'running', // completed setting timer time
  },
  running: {
    delete: 'setting',
    expire: 'alarm', // countdown reached 0
    pause: 'paused', // stop countdown, current value is on hold
    reset: 'standby', // stop countdown, return to after the time is set
  },
  paused: {
    delete: 'setting',
    reset: 'standby',
    resume: 'running',
  },
  alarm: {
    delete: 'setting',
    reset: 'standby', // AKA 'stop the alarm'
  },
  standby: { // timer reset, awaiting to start
    delete: 'setting',
    start: 'running',
  },
}
export const machine = createMachine(states)
/*^ end finite state machine */

// automatically run demostration
console.log(`Running simple-state-shifter version of countdown-timer,
output should equal 'plain' JS version:`)

// function getAllValues(obj) {
//   let values = [];
//   for (let key in obj) {
//     if (obj.hasOwnProperty(key)) {
//       if (typeof obj[key] === 'object') {
//         values = values.concat(getAllValues(obj[key]));
//       } else {
//         values.push(obj[key]);
//       }
//     }
//   }
//   return values;
// }

// console.log([...new Set(getAllValues(states))] ); // Output: [1, 2, 3, 4, 5, 6]

// import { machineSequence } from '../../../../utils'
// machineSequence(
//   machine, machine.data,
//   [
//     'reset', // noop; should be in setting already
//     'start', // setting -> running
//     'pause', // running -> paused
//     'resume', // paused -> running
//     'expire', // running -> alarm
//     'stop', // alarm -> standby
//     'start', // standby -> running
//     'reset', // running -> standby
//     'delete', // standby -> setting
//   ],
// )


console.log('(current state ~ [ available trigger(s) ])')
console.log(`machine.getState():`,machine.getState(), '~', `machine.getTriggers():`, machine.getTriggers())
console.log(`(machine.trigger('reset') will return 'undefined' since SSS doesn't return anything) & should be no op`)
console.log(`machine.trigger('reset')`,machine.trigger('reset'))
console.log(machine.getState(), '~', machine.getTriggers())
console.log(`machine.trigger('start')`,machine.trigger('start'))
console.log(machine.getState(), '~', machine.getTriggers())
console.log(`machine.trigger('pause')`,machine.trigger('pause'))
console.log(machine.getState(), '~', machine.getTriggers())
console.log(`machine.trigger('resume')`,machine.trigger('resume'))
