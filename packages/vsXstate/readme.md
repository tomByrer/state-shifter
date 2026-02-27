

## simple-state-shifter vs XState

[XState](https://stately.ai/) is more powerful out-of-the-box than simple-state-shifter.  That extra power does come with a steeper learning curve, and uses more memory and CPU to run.

|                 | XState | simple                                                        |
|-----------------|--------|---------------------------------------------------------------|
| main focus      | actors | finite state machines                                         |
| package size    | ~100KB | <1KB                                                          |
| features        | many   | very few; aims to be small, fast, & modular                   |
| context         | yes    | solution: external or custom Map()-like data                  |
| parallel states | yes    | solution: run multiple machines                               |
| parent/child    | yes    | solution: flatten &/or run multiple machines                  |
| initial state   | yes    | first state is always initial                                 |
| final state tag | yes    | solution: define 'final' state sans transactions              |
| actions         | yes    | solution: "inline function" instead of plain transition       |
| guards          | yes    | solution: "inline function" conditionally returning new state |
| state snapshots | yes    | no; but can build custom external function                    |
| website         | great  | no; just GitHub README & examples                             |
