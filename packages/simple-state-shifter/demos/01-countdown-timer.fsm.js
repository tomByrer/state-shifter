/* countdown-timer v01.03 (c) 2025 Tom Byrer */
/* https://www.mermaidchart.com/play#pako:eNp9UDFuwzAM_ArhsYA-wCFTxk5Z6wysxdhCbcqQaCRB0L_Hoh3AaOBOIu94dyIfVRM9V1g552ppolxCi7UAaMcDI1xi4qwF6GP8QehI_DHRVQyie5wUwVObuBazyErKxzAjNJQZHxI3GqLA56n0Xx9ncO4AmVWDtAVaS4PTJFJqhNkoWfAL2qjQc8_Kf1nqKQ3ItzGkN26kKbNHe95cdd7q-47zqmyRy_BO4pb8R7gGFG4aTGjf2zHdcKtn1jjadZZ-R7dlX4nr5arfJxGwpRE
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
import createMachine from '../simple-state-shifter'

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

import { machineSequence } from '../../../utils'
machineSequence(
  machine, machine.data,
  [
    'reset', // noop; should be in setting already
    'start', // setting -> running
    'pause', // running -> paused
    'resume', // paused -> running
    'expire', // running -> alarm
    'stop', // alarm -> standby
    'start', // standby -> running
    'reset', // running -> stanby
    'delete', // stanby -> setting
  ],
)
