# state-shifter(s)

## About

### JavaScript Finite State Machines that are simple to use to simplify your code, while powerful and flexible

[Finite State Machines](https://eng.libretexts.org/Under_Construction/Book:_Discrete_Structures/09:_Finite-State_Automata/9.01:_Introduction/9.1.01:_Finite-State_Machine_Overview) (FSM) helps organize your code and prevent errors by preventing a complex web of `if else / switch` statements.  If you picture your code as a flowchart with several branches, then a FSM is for you.

state-shifter seeks to make FSMs easy to learn, fun to build, while maximizing JavaScript's power and flexibility.  It is not a full DSL and ecosystem like [XState](https://stately.ai/).  Rather it is only there to progress though the state (& run the functions) you define.  state-shifter code is very minimal, with only a few conventions to remember.


## Example

<details>
<summary>Click to open background for this plain-js / `simple-state-shifter` comparison:</summary>
A client wants you to build a 'countdown timer' (sometimes found as Pomodoro timer).  He wants it to have the following modes:  

- setting (enter timer length)
- running (time is counting down)
- paused (temporary pause)
- alarm (time expired)
- standby (timer is reset to start)

Not all of these modes are to be accessible to each other; only a few triggers will transition to another mode (AKA 'state').  So you produce this [lovely diagram](https://www.mermaidchart.com/play#pako:eNp9UDFuwzAM_ArhsYA-wCFTxk5Z6wysxdhCbcqQaCRB0L_Hoh3AaOBOIu94dyIfVRM9V1g552ppolxCi7UAaMcDI1xi4qwF6GP8QehI_DHRVQyie5wUwVObuBazyErKxzAjNJQZHxI3GqLA56n0Xx9ncO4AmVWDtAVaS4PTJFJqhNkoWfAL2qjQc8_Kf1nqKQ3ItzGkN26kKbNHe95cdd7q-47zqmyRy_BO4pb8R7gGFG4aTGjf2zHdcKtn1jjadZZ-R7dlX4nr5arfJxGwpRE):

![flowchart of countdown timer](./docs/countdown-timer-diagram.avif)

Your client becomes dizzy trying to read your flowchart, so you promise him that you'll return with a quick program to demo the state transitions.  Unfortunately, you also become dizzy from all nest of `switch case if else` statements that you had to type in to get it working.  Fortunately, a friend told you about 'simple-state-shifter'.  Refactoring, you're amazed that typing in the core transition->state logic was easy & fun.  Even your client understands it!
</details>

![comparison of plain JavaScript code (47 lines) versus simple-state-shifter (25 lines of code)](./docs/js-vs-simple-state-shifter.avif)

The simple-state-shifter FSM is a short <i>clean object<i> while the same result in plain JavaScript requires many statements!  FSMs can help with development and debugging speed.

## Usage

```bash
bun i
bun run run-demos.js
```


* Each state is a key within `states={}`.  Each sub-objects have transitions (AKA triggers) listed as keys, with their values are the destination states.  Easy for everyone to read!  There are some conventions:
* you bring your own state-storage, be it a simple JS `Map()`, `useState()` hook from React, 'alien-signals` ({example}(https://github.com/tomByrer/state-shifter/blob/main/packages/simple-state-shifter/demos/02-firepit-timers.js#L7-L26)), whatever!
  + declare your base state & context names & defaults in the `presets=[ [key, value]]` array
* in `states={}`:
  + *Optional:* first `_` state is NOT a 'state', but a configuration object.
    - `id` is used by state-shifter to define the state-storage
  + First non-optional key is the 'inital' state always



## Licence

 (C)2025 Tom Byrer, rights reserved, but ask me about OSS / usage License
