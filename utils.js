/* run though a machine via an array of triggers */
export function machineSequence(machine, data, sequence=[]){
  // console.log(__filename)
  // console.log(machine)
  console.log('init entry state:', data.get(machine.stateId), '\n')
  if (data.effect){
    data.effect(() => {
      console.log(` e: ${data.get(machine.stateId)}`);
    })
  }
  // console.log("branches:", machine.branches)
  // console.log("fullMap:", machine.fullMap)
  const len = sequence.length
  for (let i=0; i<len; i++) {
    console.log(i, 'trigger:', sequence[i])
    machine.trigger(sequence[i])
    console.log(i,
      'state:', data.get(machine.stateId), '\n',
    )
  }
}

export class Timer {
  constructor() {
    this.startTime = null
    this.endTime = null
    this.intervalId = null
    this.isRunning = false
  }

  start(duration, callback) {
    if (this.isRunning){
      throw new Error('Timer is already is unning')
    }
    this.startTime = new Date().getTime()
    this.endTime = this.startTime + duration
    this.intervalId = setInterval(() => {
      const currentTime = new Date().getTime()
      if (currentTime >= this.endTime) {
        this.stop()
        callback()
      }
    }, 100)
    this.isRunning = true
  }

  stop() {
    if (!this.isRunning){
      // throw new Error('Timer is not isRunning')
    }
    clearInterval(this.intervalId)
    this.isRunning = false
  }

  isRunning(){
    return this.isRunning
  }

  getRemainingTime(){
    if (!this.isRunning){
      return 0
    }
    const currentTime = new Date().getTime()
    return Math.max(0, this.endTime - currentTime)
  }
}
