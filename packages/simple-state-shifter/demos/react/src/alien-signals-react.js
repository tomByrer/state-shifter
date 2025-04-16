import { useCallback, useSyncExternalStore } from 'react'
import { effect } from 'alien-signals'
// src github.com/gn8-ai/universe-alien-signals/blob/main/%40libs/alien-signals-react/src/signal/use-signal.ts
// likely src of src github.com/Rajaniraiyn/react-alien-signals
/**
 * current signal value
 * @template T type of signal value.
 * @param   signal signal source
 * @returns        current value
 */
export function useSignalGetter(signal){
  return useSyncExternalStore(
    (callback) => effect(()=>{
      signal(); // track
      callback()
    }),
    ()=> signal(),
    ()=> signal()
  )
}

/**
 * Internal helper: update a signal's value.
 * @template T type of signal value
 * @param   signal signal to update
 * @param   value  new value/function for current value
 * @returns        new signal value
 */
function callSignalSetter(signal, value) {
  return typeof value === 'function'
    ? signal( value(signal()) )
    : signal(value)
}
/**
 * updates a signal's value
 * @template T type of signal value.
 * @param   signal signal to update
 * @returns        callback function to update signal's value
 */
export function useSignalSetter(signal) {
  return useCallback( (value)=> callSignalSetter(signal, value), [signal] )
}
