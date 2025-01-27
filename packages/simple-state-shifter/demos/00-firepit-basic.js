/* firepit v00 */
import createMachine from '../simple-state-shfiter'

// we 'store state' outside of the FSM for flexabilty to swap state libraries
export const presets = [
  ['firepit-state', ''],
]
// data must have get(key) & set(key, value) methods
export const data = new Map(presets)


export const states ={
  _: { // 1st 'state' is configuration
    id: 'firepit',
  },
  // 2nd state is inital / default '1st state'
	empty: {
    fuel: 'standby',
  },
	standby: {
    empty: 'empty',
    ignite: 'burning',
  },
  burning: {
    extinguish: 'smoldering',
  },
  smoldering: { // simulate embers still burning
    cover: 'empty',
    fule: 'burning',
    water: 'wet',
  },
  wet: {
    dry: 'empty',
  },
}

export const machine = createMachine(states, data)
/*^ end finite state machine */


// automatically run demostration
import { machineSequence } from '../../../utils'
machineSequence(
  machine, data,
  [
    'ignite', // noop
    'fuel', 'empty', // back to empty
    'fuel', 'fuel', 'ignite',
    'approach', 'fuel', 'extinguish',
    'water', 'dry',
  ],
)
