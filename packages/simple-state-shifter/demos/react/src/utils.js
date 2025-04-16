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

  const wait =(ms=2000)=> new Promise(res => setTimeout(res, ms))
  const len = sequence.length
  async function loopWithWait(){
    for (let i=0; i<len; i++) {
      // https://regex101.com/r/sXTFia/2
      const waitSeconds = sequence[i].match(/^wait\((?<param>\d+)\)/)?.groups?.param
      if (waitSeconds){
        console.log('wait', waitSeconds)
        await wait(waitSeconds*1000)
      }
      else {
        console.log(i, 'trigger:', sequence[i])
        machine.trigger(sequence[i])
      }
      console.log(i, 'state:',  machine.getState(), ', triggers:', machine.getTriggers(), '\n',
      )
    }
  }
  loopWithWait()
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
