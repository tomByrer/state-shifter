import createMachine, {resumeMachine} from '../signaling-state-shifter'

// 2 parallel interactive FSMs
const trafficlightDef = {
  meta: {
    id: "trafficlight",
    ver: "1.2.20260307",
  },
  ctx: [
    ['checkGreenCount', 0],
  ],
  fn: {
    print: (ctx: any, str = 'default log')=>{
      console.log(str)
    },
    // GUARD
    // best practice function format:
    // name: start with `if` then what is tested abbreviated, `_goto`
    // then pass the target iv valid 
    ifCwDont_goto: (ctx: any, target='green')=>{
      ctx.set('checkGreenCount', ctx.get('checkGreenCount')+1)
      const state_crosswalk = ctx.get('crosswalkState')
      if (state_crosswalk === 'dont') {
        return target
      } else {
        console.log(`❗Waiting on crosswalk, now at: ${state_crosswalk}`)
      }
    },
  },
  states: {
    outage: {
      onEnter: "print('🕵️‍♀️ oh-oh, outage!  Blinking red 4-way!')",
      next: "print('Light is broken, blinking red, waiting for [fix].')",
      fix: "red",
      onExit: "print('🛠️ outage fixed.')",
    },
    red: {
      next: "ifCwDont_goto('green')",
      error: "outage",
    },
    green: {
      next: "yellow",
      error: "outage",
    },
    yellow: {
      next: "red",
      error: "outage",
    },
  },
};

let stateName = trafficlightDef.meta.id + 'State'  // standard, but you're free to call the name of the FSM state anything you want.
// Using 'let' instead of 'const' so we can replace them in the demo
// renaming ctx as `masterStates` for clarity and reuse in the next machine 
let { machine: tlMachine, ctx: masterStates } = createMachine(trafficlightDef, stateName, false)

const crosswalkDef = {
  meta: {
    id: "crosswalk",
    ver: "1.1.20260307",
  },
  ctx: [
    ['checkPressButtonCount', 0],
  ],
  fn: {
    print: (ctx: any, str = 'default log')=>{
      console.log(str)
    },
    printWaitStatus: (ctx: any)=>{
      console.log(`✋ Crosswalk waiting for trafficlight, now at: ${ctx.get('trafficlightState')}`)
    },
    // GUARDS
    // best practice function format:
    // name: start with `if` then what is tested abbreviated, `_goto`
    // then pass the target iv valid or in function name
    ifTlRed_WalkElseWait: (ctx: any)=>{
      ctx.set('checkPressButtonCount', ctx.get('checkPressButtonCount')+1)
      const state_trafficlight = ctx.get('trafficlightState')
      if (state_trafficlight === 'red'){
        return 'walk'
      }
      else {
        return 'wait'
      }
    },
    ifTlRed_goto: (ctx: any, target='walk')=>{
      const state_trafficlight = ctx.get('trafficlightState')
      if (state_trafficlight === 'red') {
        return target
      } else {
        console.log(`✋ Waiting on trafficlight, now at: ${state_trafficlight}`)
      }
    },
  },
  states: {
    outage: {
      onEnter: "print('🕵️‍♀️ oh-oh, outage!  Blinking red 4-way!')",
      next: "print('🔴 Light is broken, blinking \\'Don\\'t Walk\\', waiting for [fix].')",
      pressButton: "print('🚷 Light is broken, blinking \\'Don\\'t Walk\\', waiting for [fix].')",
      fix: "dont",
    },
    dont: {
      onEnter: "print('🚷 Don\\'t cross.')",
      pressButton: "ifTlRed_WalkElseWait()",
      error: "outage",
      onExit: "print('🕵️‍♀️ exiting dont.')",
    },
    wait: {
      onEnter: "printWaitStatus()",
      next: "ifTlRed_goto('walk')",
      autorun: "ifTlRed_goto('walk')",
      error: "outage",
    },
    walk: {
      onEnter: "print('🚶 Walk!')",
      next: "flash",
      error: "outage",
    },
    flash: {
      next: "dont",
      error: "outage",
    },
  },
};

const cwStateName = crosswalkDef.meta.id + 'State' // keeping state key name convention
// Using 'let' instead of 'const' so we can replace them in the demo
let { machine: cwMachine} = createMachine(crosswalkDef, cwStateName, masterStates);

// `effect` example that runs whenever the mentioned values change
// https://github.com/stackblitz/alien-signals?tab=readme-ov-file#basic-apis
masterStates.effect(()=>{
  if ( cwMachine.getState(cwStateName) === 'wait' ){ cwMachine.trigger('autorun') }
  console.log('effect: checkGreenCount =', masterStates.get('checkGreenCount'),
  ' walk button presses =', masterStates.get('checkPressButtonCount'))
})


// DEMO
function currentStatus(){
  console.log(`  states >`,
    tlMachine.getState(),
    cwMachine.getState()
  );
}
function tlLogTrigger(trigger: string, note: string) {
  console.log(`\ntlMachine.trigger('${trigger}') // ${note}`);
  tlMachine.trigger(trigger)
  currentStatus();
}
function crosswalkLogTrigger(trigger: string, note: string) {
  console.log(`\ncwMachine.trigger('${trigger}') // ${note}`);
  cwMachine.trigger(trigger);
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

  // crosswalkLogTrigger('pressButton', `walk start`);

    // check simple traffic light cycle
  tlLogTrigger('next', `red -> green`);
  tlLogTrigger('next', `green -> yellow`);
  tlLogTrigger('next', `yellow -> red`);

  // check crosswalk
  tlLogTrigger('next', `red -> green`);
  crosswalkLogTrigger('pressButton', `dont -> wait`);
  crosswalkLogTrigger('next', `noop; Waiting on trafficlight`);
  tlLogTrigger('next', `green -> yellow`);
  tlLogTrigger('next', `yellow -> red`);

  tlLogTrigger('next', `waiting on crosswalk`);
  crosswalkLogTrigger('next', `wait -> walk`);
  tlLogTrigger('next', `warn`);
  crosswalkLogTrigger('next', `walk -> flash`);
  crosswalkLogTrigger('next', `flash -> dont`);
  tlLogTrigger('next', `red -> green`);

  console.log(`
** TESTING SNAPSHOT & RESUME **`);
  // 1. Take Snapshot
  const machineSnapshot = tlMachine.getSnapshot();
  console.log('\n📸 Snapshot Created:');
  console.dir(machineSnapshot, { depth: null });

  // 2. Destroy original FSM references
  tlMachine = null as any;
  console.log('\n🗑️ tlMachine=', tlMachine);
  // logTrigger('info', `should fail; tlMachine does not exist`)

  // 3. test VERsion miss-match
  const savedVersion = machineSnapshot.meta.ver
  console.log('"break" version');
  machineSnapshot.meta.ver = "2"
  console.dir(machineSnapshot, { depth: null });
  console.log('should soon FAIL"')
  let resumedMachineFail
  try {
    resumedMachineFail = resumeMachine(trafficlightDef, machineSnapshot, false)
  }
  catch {
    console.log('restart failed')
  }
  // 3. test fixed snapshot restore
  console.log(`
"fixing" version`, savedVersion);
  machineSnapshot.meta.ver = savedVersion
  console.dir(machineSnapshot, { depth: null });
  console.log('should soon resume')
  const resumedMachineFallback = resumeMachine(trafficlightDef, machineSnapshot, true); // default resume = true
  if (resumedMachineFallback){
    tlMachine = resumedMachineFallback.machine;
    // ctx = resumedMachineFallback.ctx;
    console.log(`ifFailDefinitionFallback = true success\n🔄 Machine Resumed Successfully!'`)
  }
  else {
    console.log(`ifFailDefinitionFallback = true FAILED`)
  }

  
  tlLogTrigger('next', `testing restartMachine, init = current`)


  currentStatus();

  // // 4. Continue running to prove it functions exactly where it left off
  // logTrigger('restart', `end --> start`);
  // logTrigger('next', `start --> middle`);
  // logTrigger('add1', `Should increment the restored count (18 -> 19)`);
}

runDemo();