/* fire
simulate burning wood in a fire pit; you have to add wood, ignite it, and keep adding wood or it burns out
*/
import createMachine from '../simple-state-shfiter'
import { Timer } from '../../../utils'

import { signal, effect } from 'alien-signals'
export class StoreSignal {
  constructor(data) {
    this.store = {};
    const len = data.length
    for (let i=0;i<len;i++) {
      const [key, value] = data[i]
      this.store[key] = signal(value)
    }
  }
  effect(fn){
    effect(fn)
  }
  get(key){
    return this.store[key].get() // Returns undefined if the key doesn't exist)
  }
  set(key, value){
    this.store[key].set(value)
  }
}

export const presets = [
  ['firepit-state', ''],
  ['fire pile', 0],
  ['isBurning', false]
]
const data = new StoreSignal(presets)


/* functions for states */
const FN = {
  burnTimer: new Timer(),
  burning: function(ms=1777){
    if (this.burnTimer.isRunning) {
      return 'fire is still burning'
    }
    else {
      this.burnTimer.start(ms, this.burnLog)
      data.set('isBurning', true)
      return 'sparks...'
    }
  },
  /*
    callback for the burnTimer running out
  */
  burnLog: function(){
    data.set(
      'fire pile',
      Math.max(0, data.get('fire pile') - 1)
    )
    console.log('Now there are', data.get('fire pile'), 'fire logs left')
    if (data.get('fire pile') > 0){
      machine.trigger('continueBurning') //WORKAROUND: set a new burn timer
    }
    else {
      machine.trigger('extinguish')
    }
  },

  depleteFuel: function(){
    
    return 'empty'
  },
  
  emptyFNPile: function(){
    data.set('fire pile', 0)
    console.log('fire pile emptied to', data.get('fire pile'))
  },

  extinguish: function(){
    this.burnTimer.stop()
    data.set('isBurning', false)
    data.set(
      'fire pile',
      Math.max(0, data.get('fire pile') - 1)
    )
    console.log('fire pile stoped burning at', data.get('fire pile'), 'logs left')
        return 'standby'
  },

  fuel: function(amt){
    data.set('fire pile', data.get('fire pile') + amt)
    console.log('🪵 fire pile is now', data.get('fire pile'), 'high')
  },
}


export const states = {
  _: { // 1st 'state' is configuration
    id: 'firepit',
  },
  // 2nd state is inital / default '1st state'
	empty: {
    _: { fnEnter: ()=>{ console.log('Only ash and small fragments of wood remains in the fire pit.')
     }, },
    fuel: (amt=1)=>{
      FN.fuel(amt)
      return 'standby'
    },
  },
	standby: {
    _: { fnEnter: ()=>{ console.log('Wood sits in the pit, cold yet eager to burn') }, },
    empty: ()=>{
      FN.emptyFNPile()
      //IDEA pick up wood into 'carrying wood' inventory
      return 'empty'
    },
    fuel: (amt=1)=>{ FN.fuel(amt) },
    ignite: ()=>{
      FN.burning(999)
      return 'burning'
    },
  },
  burning: {
    _: { fnEnter: ()=>{ console.log('🔥') }, },
    depleteFuel: ()=>{
      
    console.log('FN is exausted')
      FN.depleteFuel()
      return 'empty'
    },
    continueBurning: ()=>{ FN.burning() },
    extinguish: ()=>{
      const ret = FN.extinguish() // prevent cheat by getting new fuel after partly burning
      return 'standby'
    },
    fuel: (amt=1)=>{ FN.fuel(amt) },
  },
  //IDEA wet when extinguished
}
export const machine = createMachine(states, data)
/*^ end finite state machine */


// automatically run demostration
import { machineSequence } from '../../../utils'
machineSequence(
  machine, data,
  [
    'fuel','empty','fuel','ignite','fuel', //test burning:fuel
    'faketrigger', // should not trigger effect()
    'extinguish','ignite','fuel','fuel', // when fule runs out, last effect() = standby
    // 'depletedFuel', // test jump to empty
  ] // test reduced before heroMachine tiein
)
