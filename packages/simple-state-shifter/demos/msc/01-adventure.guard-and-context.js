// showcasing guard conditions and global context
// in text adventure game
import createMachine from '../../simple-state-shifter'

let number = 0


// helper
export function print(str='default log'){
  console.log(str)
}

const context = {
  orientToSound: 0.05,
  oddsToFind: 0.10,
  doorLocked: true,
  unlatched: false,
}

const states ={
  // first 'state' is always the initial/default
  room: {
    turnOnLight: ()=>{
      print(`You can't find the light switch; perhaps you should look for it?`)
      // noop; stay in state/room
    },
    pullOutCellphone: ()=>{
      print(`Oh no!  Who ever put you here, they took your cellphone.  Still very dark here.`)
      // noop; stay in state/room
    },
    headToSound: ()=>{
      // FSM random 'guard' condition:
      if (Math.random() < context.oddsToFind){
        print(`🧱 You find a wall, with a faint light at the bottom of it about a meter wide...`)
        return 'wall'
      } 
      else {
        print(`💥 On the way to the sound, you bump into what feels like office furniture.`)
        context.oddsToFind += context.oddsToFind // increase odds so we don't want to bump into things all day
        // stay in room; need to find wall
      }
    },
    listen: ()=>{
      if (context.orientToSound >= 0.20){
        print(`You are fairly certain of the direction of the noise.`)
      }
      else{
        print(`👂 You orient yourself towards the echos better.`)
        context.oddsToFind += context.orientToSound
        context.orientToSound += context.orientToSound
      }
    }
  },
  
  wall: {
    listen: ()=>{
      print(`👂 You hear some echos from under the wall, but are unsure what they are.`)
    },
    look: ()=>{
      print(`🧎‍♀️Dropping to your knees, you hope to be able to see though the gap along the floor.  You feel fustrated that you can't see past the gap.  Is there something opaque blocking your view, or is your eyes blurry?`)
    },
    feel: ()=>{
      print(`🚪 You run your hands along the floor, then up the wall.  You feel some metal on both sides of the light, like it is framing for a door...`)
      return 'door'
    }
  },

  door: {
    knock: ()=>{
      print(`Knocking madly with great force, you hope to gain the attention of someone to rescue you..
  pounding more, you hear only echos of your pounding.`)
    },
    findKeys: ()=>{
      print(`Your keys are missing from your pockets, along with your cellphone and that business card you picked up this morning.`)
    },
    feel: ()=>{
      print(`You feel around for a door knob, and discover bolt latch above it`)
    },
    unlatch: ()=>{
      print(`🔓 You hear a deep click and feel the door vibrations as you turn the latch handle.`)
      context.unlatched = true
    },
    openDoor: ()=>{
      if (context.unlatched){ // 'guard' condition
        print(`🚪 Fresh air waifs across your sweat as you slowly open the door....`)
        return 'exit'
      }
      else{
        print(`Feels solidly locked.`)
      }
    },
  },

  exit: {
    leave: ()=>{
      print(`As you lave the room, your eyes adjust to the harsh light from a large monitor across the hall.  It reads:

Thanks for testing tomByrer/simple-state-shifter!  For more adventures follow me on:
http://github.com/tomByrer
`)
    }
  }
}

const machine = createMachine(states)
/*^ end finite state machine */

/*^ begin demo tests*/
const wait = (ms) => new Promise(res => setTimeout(res, ms))
function currentStatus(){
  console.log(`  state >`, machine.getState(),
    `<
with triggers:`, machine.getTriggers(),
`
 orientToSound:`, context.orientToSound, ` oddsToFind:`, context.oddsToFind
)
}
function logTrigger(trigger, note){
  console.log(`
machine.trigger('${trigger}') // ${note}
`)
  machine.trigger(trigger)
  currentStatus()
}
currentStatus()

async function runDemo() {
  logTrigger('nothing', `noop; should be in standby`)
  await wait(11)
  logTrigger('pullOutCellphone', `...`)
  await wait(11)
  logTrigger('turnOnLight', ``)
  await wait(11)
  logTrigger('headToSound', ``)
  await wait(11)
  logTrigger('listen', ``)
  await wait(11)
  logTrigger('headToSound', ``)
  await wait(11)
  logTrigger('listen', ``)
  await wait(11)
  logTrigger('headToSound', ``)
  await wait(11)
  logTrigger('listen', ``)
  await wait(11)
  logTrigger('headToSound', ``)
  await wait(11)
  logTrigger('listen', ``)
  await wait(11)
  logTrigger('headToSound', ``)
  await wait(11)
  logTrigger('listen', ``)
  await wait(11)

  console.warn(`
  Hopefully you found the wall by now`)
  await wait(11)
  logTrigger('listen', ``)
  await wait(11)
  logTrigger('look', ``)
  await wait(222)
  logTrigger('feel', ``)

  await wait(11)
  logTrigger('openDoor', ``)
  await wait(11)
  logTrigger('knock', ``)
  await wait(11)
  logTrigger('findKeys', ``)
  await wait(11)
  logTrigger('openDoor', ``)
  await wait(11)
  logTrigger('feel', ``)
  await wait(11)
  logTrigger('unlatch', ``)
  await wait(11)
  logTrigger('openDoor', ``)
  await wait(222)

  logTrigger('leave', ``)
  await wait(11)
}
runDemo()
/*^ end demo */