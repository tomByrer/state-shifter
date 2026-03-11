// Example: walk though all features
import createMachine, {resumeMachine} from '../signaling-state-shifter'

const LIMIT = 10

const featuresDef = {
  meta: {
    id: 'features',
    ver: '1.0.20360306',
  },
  ctx: [
    ['count', 0],
    ['checked', false],
  ],
  fn: {
    fixedMessage: ()=>{
      console.log(`No Parameter because this is a fixed message.`)
    },
  // _ = unused ctx placeholder
    print: (_, str = 'default log')=>{
      console.log(str)
    },
    add1: (ctx: any)=>{
      ctx.set('count', ctx.get('count') + 1)
      console.log('count add1 =', ctx.get('count'))
    },
    addNumber: (ctx: any, str: any)=>{
      ctx.set('count', ctx.get('count') + Number(str) )
      console.log(`count + ${str} =`, ctx.get('count'))
    },
    // guards
    ifCountGT_goto: (ctx: any, target='onEnterExit')=>{
      const count = ctx.get('count')
      if (count > LIMIT){
        return target
      }
      else {
        console.log(`⁋ Count needs to be over ${LIMIT}, but is only ${count}`)
      }
    },
    ifCountLTE_goto: (ctx: any, target='triggeredFunctions')=>{
      const count = ctx.get('count')
      if (count <= LIMIT){
        return target
      }
      else {
        console.log(`⁋ Count needs to be under or equal to ${LIMIT}, but is now ${count}`)
      }
    },

    // tests known broken
    returnUndefined:()=>{return undefined}, //DO NOT FIX

    status: (ctx: any, note = '')=>{
      console.log(`${note}
📜  init: ${featuresDef.ctx}
 current: ${ctx.getSnapshot()}
 `)
    },
  }, //fn
  states: {
    // The first state is always the 'entry' state
    enterFirst: {
      next: `triggeredFunctions`,
    },
    triggeredFunctions: {
      noParameter: "fixedMessage()",
      staticParameter: "print(staticParameter test)",
      staticParameterNested: "print(`Inner \"quotes\", single quote's, `backtick` and (parens)!`)",
      add1: "add1()",
      addFixedParameter: "addNumber(5)",
      addPassedParameter: "addNumber()",
      passParameterInside: "print(`Here is passed by trigger: $param`)",
      next: 'guards',
    },
    guards: {
      return: "ifCountLTE_goto('triggeredFunctions')",
      next: "ifCountGT_goto('testErrors')",
    },
    testErrors: {
      onEnter: "print('📜onEnter in testErrors ran; should only be once.')",
      testMalformedTarget: "extraClosingParen)",
      testUndefinedTarget: undefined,
      testUndefinedFnReturn: "returnUndefined()",
      testSameState: 'testErrors',
      testWrongState: 'doesNotExist',
      next: "fini",
    },
    fini:{
      onEnter: "status('Final state; results:')",
      // final state since no exit target 
    }
  }
}
let {machine} = createMachine( featuresDef )
/*^ end finite state machine */

/*v begin demo tests*/
function currentStatus(){
  console.log(`  state >`, machine.getState(),`<`
// with triggers:`, machine.getTriggers()
  )
}
function logTrigger(trigger, note){
  console.log(`
machine.trigger('${trigger}') // ${note}`)
  machine.trigger(trigger)
  currentStatus()
}
currentStatus()

async function runDemo() {
  logTrigger('next', `enterFirst --> triggeredFunctions`)
  // state: middle
  logTrigger('noParameter', `noop, just log`)
  logTrigger('staticParameter', `noop, log message passed between parens.`)
  logTrigger('staticParameterNested', `noop, log message passed between outer parens and matching outer quotes.`)
  logTrigger('add1', `count add1 = 1`)
  logTrigger('addFixedParameter', `count + 5 = 6`)
  logTrigger('addPassedParameter(2)', `count + 2 = 8`) // NOTE: trigger-passed parameters are always strings
  logTrigger('passParameterInside(test)', `Here is passed by trigger: test`)
  logTrigger('next', `triggeredFunctions --> guards`)
  // state: guards
  logTrigger('next', `warn count is too low`)
  // return to previous state where the math functions are.  We could have added other triggers to this state, but decided not to.
  logTrigger('return', `guards --> triggeredFunctions`)
  logTrigger('addPassedParameter(3)', `count + 3 = 11`)
  logTrigger('next', `triggeredFunctions --> guards`)
  logTrigger('return', `warn count is too high`)
  logTrigger('next', `onEnterExit --> testErrors`)
  // state: testErrors
  logTrigger('testTriggerDoesNotExist', `Invalid trigger/target`)
  logTrigger('testMalformedTarget', `Malformed target`)
  logTrigger('testUndefinedTarget', `Invalid trigger/target`)
  logTrigger('testUndefinedFnReturn', `noop`)
  logTrigger('testSameState', `Prevented attempt to retrigger`)
  logTrigger('testWrongState', `Invalid attempt for newState`)
  logTrigger('next', `testErrors --> fini`)
}
runDemo()
/*^ end demo */