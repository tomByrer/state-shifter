/* countdown-timer v00.04; plain JS (c) 2025 Tom Byrer

This is to show how in some languages implement a 'State Machine'
without using a state machine library, with only conditional statements.
Sometimes a FSM is not so obvious like this, the condtions
are spread out over 100+ lines of code.
*/
/* 
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

// simulate 'store state' outside of the FSM for intergration
// with other state libraries or FE frameworks
// data must have get(key) & set(key, value) methods
const data = new Map([['state', '']])

class TimerStateMachine {
  constructor() {
    data.set('state', 'setting') // initial state
  }

  trigger(event) {
    switch (data.get('state')) {

      case 'setting':
        if (event === 'start') {
          data.set('state', 'running')
        }
        break;

      case 'running':
        if (event === 'delete') {
          data.set('state', 'setting')
        } else if (event === 'expire') {
          data.set('state', 'alarm')
        } else if (event === 'pause') {
          data.set('state', 'paused')
        } else if (event === 'reset') {
          data.set('state', 'standby')
        }
        break;

      case 'paused':
        if (event === 'delete') {
          data.set('state', 'setting')
        } else if (event === 'reset') {
          data.set('state', 'standby')
        } else if (event === 'resume') {
          data.set('state', 'running')
        }
        break;

      case 'alarm':
        if (event === 'delete') {
          data.set('state', 'setting')
        } else if (event === 'reset') {
          data.set('state', 'standby')
        }
        break;

      case 'standby':
        if (event === 'delete') {
          data.set('state', 'setting')
        } else if (event === 'start') {
          data.set('state', 'running')
        }
        break;

      default:
        data.set('state', 'setting')
        break;
    }

  }

  get() {
    return data.get('state')
  }
}

// Example usage
const machine = new TimerStateMachine()
/*^ end finite state machine */


// automatically run demostration

console.log(`Running plain JS version of countdown-timer:`)
machineSequence(
  machine, data,
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

/* run though a machine via an array of triggers */
function machineSequence(machine, data, sequence=[]){
  console.log('init entry state:', data.get('state'), '\n')
  if (data.effect){
    data.effect(() => {
      console.log(` e: ${data.get('state')}`);
    })
  }
  const len = sequence.length
  for (let i=0; i<len; i++) {
    console.log(i, 'trigger:', sequence[i])
    machine.trigger(sequence[i])
    console.log(i,
      'state:', data.get('state'), '\n',
    )
  }
}
