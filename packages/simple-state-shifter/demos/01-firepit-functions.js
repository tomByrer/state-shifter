/* firepit v01 */
import createMachine from '../simple-state-shfiter'

export const presets = [
  ['firepit-state', ''],
  ['fire pile', 0],
]
// data must have get(key) & set(key, value) methods
export const data = new Map(presets)


/* functions for states */
function fuel(){
  data.set('fire pile', data.get('fire pile') + 1)
  console.log('🪵 fire pile is now', data.get('fire pile'), 'high')
}


export const states ={
  _: { // 1st 'state' is configuration
    id: 'firepit',
  },
  // 2nd state is inital / default '1st state'
	empty: {
    fuel: ()=>{
      fuel()
      return 'standby'
    },
    look: ()=>{ console.log(`This is a good place for a bonfire,
hungry for fuel to burn.`) },
  },
	standby: {
    empty: ()=>{
      data.set('fire pile', 0)
      return 'empty'
    },
    fuel: ()=>{ fuel() },
    ignite: 'burning',
    look: ()=>{ console.log(`You have ${ data.get('fire pile') } wood logs,
resting in the pit,
cold yet eager ignite.`) },
  },
  burning: {
    _: {
      fnEnter: ()=>{ console.log('🔥 fire burns') },
    },
    extinguish: 'smoldering',
    fuel: ()=>{ fuel() },
    look: ()=>{
      console.log(`You have ${ data.get('fire pile') } logs remaining` )
      return 'burning'
    }
  },
  smoldering: { // simulate embers still burning
    cover: 'empty',
    fuel:()=>{
      fuel()
      console.log('✨ embers respark the fire')
      return 'burning'
    },
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
    'look', 'fuel', 'empty', // back to empty
    'fuel', 'fuel', 'look', 'ignite',
    'noop', '_', // should do nothing
    'fuel', 'look', 'extinguish',
    'fuel', 'extinguish', // always ensure the fire is out!
    'water', 'dry',
  ],
)
