import { effect } from 'alien-signals';
import { useCallback, useSyncExternalStore } from 'react';
/**
 * Internal helper function to get current value of a signal.
 * @template T type of signal value.
 * @param   signal signal to get value from.
 * @returns        current value of signal.
 */
export function useSignalGetter(signal) {
    return useSyncExternalStore((callback) => effect(() => {
        signal(); // track
        callback();
    }), () => signal(), () => signal());
}
/**
 * Internal helper function to update a signal's value.
 * @template T type of signal value
 * @param   signal signal to update.
 * @param   value  new value or a function that receives current value and returns a new value.
 * @returns        new value of signal.
 */
function callSignalSetter(signal, value) {
    return typeof value === 'function'
        ? signal(value(signal()))
        : signal(value);
}
/**
 * Internal helper function to update a signal's value.
 * @template T type of signal value.
 * @param   signal signal to update.
 * @returns        A callback function that can be used to update signal's value.
 */
export function useSignalSetter(signal) {
    return useCallback((value) => callSignalSetter(signal, value), [signal]);
}
/**
 * React hook returning `[value, setValue]` for a given Alien Signal.
 * @example
 * ```ts
 * import { useSignal } from '@gn8/alien-signals-react';
 * import { signal } from 'alien-signals';
 * const $count = signal(0);
 * function Counter() {
 *   const [count, setCount] = useSignal($count);
 *   return (
 *     <button onClick={() => setCount(count + 1)}>
 *       {count}
 *     </button>
 *   );
 * }
 * ```
 * @template T type of signal value.
 * @param   signal signal to read/write.
 * @returns        A tuple [currentValue, setValue].
 */
export function useSignal(signal) {
    return [useSignalGetter(signal), useSignalSetter(signal)];
}
