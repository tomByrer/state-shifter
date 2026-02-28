import createMachine from '../signaling-state-shifter'

// helper
export function print(str = 'default log') {
  console.log(str)
}

const trafficlightDef = {
  meta: {
    id: 'trafficlight',
    ver: '1.0.20360224', // Added version here
  },
  // ctx: [
  // ],
  fn: {
    whatthis: ({ ctx }: FSMContext) => { 
      console.log('whatthis count is:', ctx.get('count')) 
    },
  },
  states: {
    outage: {
      onEnter: ()=>{ print('🕵️‍♀️ oh-oh, outage!  Blinking red 4-way!') },
      next: ()=>{ print(`Light is broken, blinking red, waiting for [fix].`) },
      fix: 'red',
    },
    red: {
      onEnter: ({ ctx }: FSMContext) => {
        const state_crosswalk = ctx.get('crosswalkState')
        if (state_crosswalk === 'wait') {
          return 'green'
        } else {
          print(`❗Waiting on crosswalk, now at: ${state_crosswalk}`)
        }
      },
      next: ({ ctx }: FSMContext) => {
        const state_crosswalk = ctx.get('crosswalkState')
        if (state_crosswalk === 'dont') {
          return 'green'
        } else {
          print(`❗Waiting on crosswalk, now at: ${state_crosswalk}`)
        }
      },
      error: 'outage',
      onExit: ()=>{ print('🕵️‍♀️ onExit note.') },
    },
    green: {
      next: 'yellow',
      error: 'outage',
    },
    yellow: {
      next: 'red',
      error: 'outage',
    },
  },
};
let stateName = trafficlightDef.meta.id + 'State'  // standard, but you're free to call the name of the FSM state anything you want.
// const masterStates = createMaps(addDef, stateName)
// Using 'let' instead of 'const' so we can replace them in the demo
let { machine: tlMachine, ctx: masterStates } = createMachine(trafficlightDef, stateName, false)

const crosswalkDef = {
  meta: {
    id: 'crosswalk',
    ver: '1.0.20360224', // Added version here
  },
  // ctx: [
  // ],
  fn: {
    whatthis: ({ ctx }: FSMContext) => { 
      console.log('whatthis count is:', ctx.get('count')) 
    },
  },
  states: {
    outage: {
      onEnter: ()=>{ print('🕵️‍♀️ oh-oh, outage!  Blinking red 4-way!') },
      // convenance error note
      next: ()=>{ print(`❗Light is broken, blinking 'Don't Walk', waiting for [fix].`) },
      // convenance error note
      pressButton: ()=>{ print(`❗Light is broken, blinking 'Don't Walk', waiting for [fix].`) },
      fix: 'dont',
    },
    dont: {
      onEnter: ()=>{ print(`🕵️‍♀️ Don't cross.`) },
      pressButton: ({ ctx }: FSMContext) => {
        const state_trafficlight = ctx.get('trafficlightState')
        if (state_trafficlight === 'stop') {
          return 'walk'
        }
        else {
          return 'wait'
        }
      },
      error: 'outage',
      onExit: ()=>{ print('🕵️‍♀️ exiting dont.') },
    },
    wait: {
      onEnter: ({ ctx })=>{ print(`Crosswalk waiting for trafficlight, now at: ${ctx.get('trafficlightState')}`) },
      next: ({ ctx }: FSMContext) => {
        const state_trafficlight = ctx.get('trafficlightState');
console.log('TL in wait', state_trafficlight)
        if (state_trafficlight === 'red') {
          return 'walk'
        } else {
          print(`❗Waiting on trafficlight, now at: ${state_trafficlight}`)
        }
      },
      error: 'outage',
      onExit: ()=>{ print('🕵️‍♀️ onExit note.') },
    },
    walk: {
      onEnter: ()=>{ print(`Walk!`) },
      next: 'flash',
      error: 'outage',
    },
    flash: { // flashing walk
      next: 'dont',
      error: 'outage',
    },
  },
};
stateName = crosswalkDef.meta.id + 'State'
// masterStates.mergePresets([[stateName, '']])
// Using 'let' instead of 'const' so we can replace them in the demo
let { machine: crosswalkMachine} = createMachine(crosswalkDef, stateName, masterStates);

// DEMO

// function testPresetMerge(){
//   console.log(`testPresetMerge`)
//   const testPresets = [
//     ['state', 'start'],
//   ]
//   const context = new SignalMapish(testPresets)
//   console.log('first snapshot', context.getSnapshot() )
//   const addPresets = [
//     ['count', 0],
//   ]
//   context.mergePresets(addPresets)
//   console.log('merged snapshot', context.getSnapshot() )
// }testPresetMerge()

function currentStatus() {
  console.log(`  states >`,
    tlMachine.getState(),
    crosswalkMachine.getState(),
    // `\n  count:`, masterStates.get('count')
  );
}
function tlLogTrigger(trigger: string, note: string) {
  console.log(`\ntlMachine.trigger('${trigger}') // ${note}`);
  tlMachine.trigger(trigger);
  currentStatus();
}
function crosswalkLogTrigger(trigger: string, note: string) {
  console.log(`\ncrosswalkMachine.trigger('${trigger}') // ${note}`);
  crosswalkMachine.trigger(trigger);
  currentStatus();
}
console.log('--- STARTING DEMO ---');
currentStatus();

async function runDemo() {
  // check fixes
  tlLogTrigger('next', `inop: warn`);
  tlLogTrigger('fix', `outage -> red`);
  crosswalkLogTrigger('pressButton', `warn`);
  tlLogTrigger('error', `red -> outage`);
  tlLogTrigger('fix', `outage -> red`);
  crosswalkLogTrigger('fix', `outage -> dont`);

  // check simple traffic light cycle
  tlLogTrigger('next', `red -> green`);
  tlLogTrigger('next', `green -> yellow`);
  tlLogTrigger('next', `yellow -> red`);

  // check crosswalk
  tlLogTrigger('next', `red -> green`);
  crosswalkLogTrigger('pressButton', `dont -> wait`);
  crosswalkLogTrigger('next', `warn`);
  tlLogTrigger('next', `green -> yellow`);
  tlLogTrigger('next', `yellow -> red`);

  tlLogTrigger('next', `waiting on crosswalk`);
  crosswalkLogTrigger('next', `wait -> walk`);
  tlLogTrigger('next', `warn`);
  crosswalkLogTrigger('next', `walk -> flash`);
  crosswalkLogTrigger('next', `flash -> dont`);
  tlLogTrigger('next', `red -> green`);

  // console.log('      TESTING SNAPSHOT & RESUME         ');
  // // 1. Take Snapshot
  // const machineSnapshot = machine.getSnapshot();
  // console.log('\n📸 Snapshot Created:');
  // console.dir(machineSnapshot, { depth: null });

  // // 2. Destroy original FSM references
  // machine = null as any;
  // ctx = null as any;
  // console.log('\n🗑️ Machine deleted in memory.');

  // // 3. Resume from snapshot

  // // test broken snapshot
  // console.log('\n📸 Snapshot broken:')
  // // machineSnapshot.meta.ver = '1'
  // console.dir(machineSnapshot, { depth: null });

  // const resumedMachineFail = resumeMachine(addDef, machineSnapshot, false);
  // if (resumedMachineFail){
  //   machine = resumedMachineFail.machine;
  //   ctx = resumedMachineFail.ctx;
  //   console.log(`ifFailDefinitionFallback = false FAILED`)
  // }
  // else {
  //   console.log(`ifFailDefinitionFallback = false success`)
  // }
  // const resumedMachineFallback = resumeMachine(addDef, machineSnapshot); // default resume = true
  // if (resumedMachineFallback){
  //   machine = resumedMachineFallback.machine;
  //   ctx = resumedMachineFallback.ctx;
  //   console.log(`ifFailDefinitionFallback = true success\n🔄 Machine Resumed Successfully!'`)
  // }
  // else {
  //   console.log(`ifFailDefinitionFallback = true FAILED`)
  // }

  // currentStatus();

  // // 4. Continue running to prove it functions exactly where it left off
  // logTrigger('restart', `end --> start`);
  // logTrigger('next', `start --> middle`);
  // logTrigger('add1', `Should increment the restored count (18 -> 19)`);
}

runDemo();