import { useCallback, useEffect, useRef, useReducer,  useState, useSyncExternalStore } from 'react'
import * as CT from "./02-countdown-timer.full"
import * as ASR from './alien-signals-react'

const App = () => {
  const $get = {}  /* $get is preset/context useStates */
  const $SET = {}
  const len = CT.presets.length
  for (let i = 0; i < len; i++){
    const [key,] = CT.presets[i]
    $get[key] = ASR.useSignalGetter( CT.data.store[key] )
    $SET[key] = ASR.useSignalSetter( CT.data.store[key] )
  }
// console.log('data:', $get['inputSeconds'],  $get['remainingSeconds'], )
  const [triggersActive, setTriggersActive] = useState( { start:'active' } ) //FIXME don't cheat init
  const [lastTriggered, setLastTriggered] = useState( '> none <' ) // only for demo & testing
  // const [stateFSM, setStateFSM] = useState( CT.machine.getState() )
  const [stateActive, setStateActive] = useState( { [ CT.machine.getState() ]:'active' } )
  const [time, setTime] = useState( $get['remainingSeconds'] )

  const btnLabels = [ 'delete', 'expire', 'pause', 'reset', 'resume', 'start'] //all FSM triggers
  const ButtonList = ({labels, onClick}) => {
// console.log('labels', labels)
    return (
      <div className='nav'>
        {labels.map((label, index) => (
          <button
            key={index}
            className={triggersActive[label]}
            onClick={()=>onClick(label)}
          >
            {label}
          </button>
        ))}
      </div>
    )
  }

  function secToTime(sec){
    const HH = String( Math.floor(sec * 0.0002777778) ).padStart(2, '0')
    const remainingSeconds = sec % 3600;
    const MM = String( Math.floor(remainingSeconds * 0.0166666667) ).padStart(2, '0')
    const SS = String( remainingSeconds % 60 ).padStart(2, '0')
    return {HH , MM , SS}
  }
  function updateUI(){
    // setStateFSM( CT.machine.getState() )
    setStateActive( { [ CT.machine.getState() ]:'active' } )
    const activeList = CT.machine.getTriggers()
    setTriggersActive( btnLabels.reduce(
      (acc,key)=>(acc[key] = (activeList.includes(key)) ? 'active' : '', acc), {})
    )
    setTime( secToTime( $get['remainingSeconds'] ) )
console.log('update:', time, activeList)
  }
  // FSM UI
  const handleTrigger =(label)=>{
    setLastTriggered(label)
    CT.machine.trigger(label)
    // updateUI() now via useEffect

  }

  const formHrRef = useRef(null)
  const formMinRef = useRef(null)
  const formSecRef = useRef(null)
  function storeNewTime(){
    const sec = formHrRef.current.value * 3600
      + formMinRef.current.value * 60
      + (+formSecRef.current.value)
    console.log('submit', sec)
    $SET['inputSeconds'](sec)
    $SET['remainingSeconds'](sec)
  }
  function handleSubmit(e){
    e.preventDefault()
    storeNewTime()
    handleTrigger('start')
  }

  useEffect(() => {
console.log('effect', $get['state'] )
updateUI()
  }, [ $get['state'], $get['remainingSeconds'], ] );

  return (
    <main>
      <article id="fsm">
        <h1><a href="https://github.com/tomByrer/state-shifter">simple-state-shifter</a> (finite state machine)</h1>
        <h2>countdown timer FSM demo</h2>
        <section id="fsmio">
          <div>current state: <b>{$get['state']}</b> &nbsp; (transition to new state by clicking on trigger)</div>
          <div>triggers:&nbsp; <ButtonList labels={btnLabels} onClick={handleTrigger} /></div>
          <div>last triggered: <i>{lastTriggered}</i></div>
        </section>
      </article>
  
  <pre id="code">
  <div>{`import createMachine from
   '../simple-state-shifter'`}</div>
  <div>{`const states ={`}</div>
  <div><span className={stateActive['setting']}>{` setting: {`}</span></div>
  <div><span className={stateActive['setting']}>  start: 'running',</span></div>
  <div><span className={stateActive['setting']}>{`  },`}</span></div>
  <div><span className={stateActive['running']}>{` running: {`}</span></div>
  <div><span className={stateActive['running']}>  delete: 'setting',</span></div>
  <div><span className={stateActive['running']}>  expire: 'alarm',</span></div>
  <div><span className={stateActive['running']}>  pause: 'paused',</span></div>
  <div><span className={stateActive['running']}>  reset: 'standby',</span></div>
  <div><span className={stateActive['running']}>{`  },`}</span></div>
  <div><span className={stateActive['paused']}>{` paused: {`}</span></div>
  <div><span className={stateActive['paused']}>  delete: 'setting',</span></div>
  <div><span className={stateActive['paused']}>  reset: 'standby',</span></div>
  <div><span className={stateActive['paused']}>  resume: 'running',</span></div>
  <div><span className={stateActive['paused']}>{`  },`}</span></div>
  <div><span className={stateActive['alarm']}>{` alarm: {`}</span></div>
  <div><span className={stateActive['alarm']}>  delete: 'setting',</span></div>
  <div><span className={stateActive['alarm']}>  reset: 'standby',</span></div>
  <div><span className={stateActive['alarm']}>{`  },`}</span></div>
  <div><span className={stateActive['standby']}>{` standby: {`}</span></div>
  <div><span className={stateActive['standby']}>  delete: 'setting',</span></div>
  <div><span className={stateActive['standby']}>  start: 'running',</span></div>
  <div><span className={stateActive['standby']}>{`  },`}</span></div>
  <div>{`export const machine
   = createMachine(states)`}</div>
  </pre>
  
    <svg
      aria-roledescription="stateDiagram"
      role="graphics-document document"
      viewBox="-0.2044992446899414 -9.5367431640625e-7 604.4880981445312 303.2730407714844"
      // viewBox="-0.2044992446899414 -9.5367431640625e-7 604.4880981445312 303.2730407714844"
      // style={{
      //   maxWidth: "604.4880981445312px",
      // }}
      className="statediagram"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      id="fsmsvg"
    >
      <style xmlns="http://www.w3.org/1999/xhtml">
      </style>
      <g>
        <defs>
          <marker
            orient="auto"
            markerUnits="userSpaceOnUse"
            markerHeight={14}
            markerWidth={20}
            refY={7}
            refX={19}
            id="fsmsvg_stateDiagram-barbEnd"
          >
            <path d="M 19,7 L9,13 L14,7 L9,1 Z" />
          </marker>
        </defs>
        <g className="root">
          <g className="clusters" />
          <g className="edgePaths">
            <path
              markerEnd="url(#fsmsvg_stateDiagram-barbEnd)"
              data-points="W3sieCI6MjMuODg1MDQyMTkwNTUxNzU4LCJ5IjoxNzIuMjE3OTQzMTkxNTI4MzJ9LHsieCI6NDguODg1MDQyMTkwNTUxNzYsInkiOjE3Mi4yMTc5NDMxOTE1MjgzMn0seyJ4Ijo3My44ODUwNDIxOTA1NTE3NiwieSI6MTcyLjIxNzk0MzE5MTUyODMyfV0="
              data-id="edge0"
              data-et="edge"
              data-edge="true"
              style={{
                fill: "none",
              }}
              className={"edge-thickness-normal edge-pattern-solid transition " + stateActive['start']}
              id="edge0"
              fill="none"
              strokeWidth={1}
              stroke="#000"
              d="M24.351140927774033 171.87988573442158 C32.89055264879316 172.34357530850824, 42.416778593662016 172.4899399383685, 49.27093463148537 172.63475815550797 M24.12879013507999 172.11241037924003 C33.5262068882593 171.87798493715778, 43.47457414239423 171.92431975569085, 48.97031235348175 172.04029630822964 M48.97070401097025 171.76470559932318 C54.87014472656838 172.2481391671097, 61.22280301016261 172.31230334166958, 73.71021282661134 171.98848994831874 M48.78856465684218 172.03004072986425 C54.34249276881184 172.2665450596723, 59.61255559722461 171.98734967121763, 73.90966952858662 172.50722661405385"
            />
            <path
              markerEnd="url(#fsmsvg_stateDiagram-barbEnd)"
              data-points="W3sieCI6MTMwLjQwMDk3NDk0NDA3MTUsInkiOjE1NS42NzM5NTc4MjQ3MDcwM30seyJ4IjoxNzcuNjk5MTE5NTY3ODcxMSwieSI6MTI2LjMwNzAyOTcyNDEyMTF9LHsieCI6MjIxLjc3MjU1ODIxMjI4MDI3LCJ5IjoxMzguMDc4MDE1MTI4OTM0Njh9XQ=="
              data-id="edge1"
              data-et="edge"
              data-edge="true"
              style={{
                fill: "none",
              }}
              className={"edge-thickness-normal edge-pattern-solid transition " + stateActive['setting']}
              id="edge1"
              fill="none"
              strokeWidth={1}
              stroke="#000"
              d="M130.3869586754523 156.142602599705 C144.83231069412844 146.24706709668828, 159.0848625156218 137.90243197742603, 167.24504042419443 133.14574051246038 M130.31029929111307 155.6063045400936 C140.1986922009546 149.76865018314007, 149.7107433742949 143.435279966552, 167.29075278739742 133.2311057073024 M167.00094532673978 132.94941530278834 C174.54689198085543 128.12388893249283, 181.28852471508583 127.3315948438282, 190.2718846113032 129.98795891516318 M167.27669098109658 132.73932904344503 C173.46731351345127 128.67547477433644, 181.60196307465992 126.7974517796529, 189.67159030272455 129.61639286433532 M190.30776020213995 129.19051924699417 C201.8437612898172 132.79066180028573, 212.62544754270073 135.67720726006573, 221.59207135372458 138.47812732754784 M190.14080486521752 129.62491323831551 C198.294901477781 131.61440063507743, 206.51882975495474 134.14793947208054, 221.48413522509497 138.26728956318914"
            />
            <path
              markerEnd="url(#fsmsvg_stateDiagram-barbEnd)"
              data-points="W3sieCI6MjIxLjc3MjU1ODIxMjI4MDI3LCJ5IjoxNTUuNTI2NjY5NzAwNzc3MjN9LHsieCI6MTc3LjY5OTExOTU2Nzg3MTEsInkiOjE2Ny4yOTc2NTUxMDU1OTA4Mn0seyJ4IjoxMzMuNjI1NjgwOTIzNDYxOSwieSI6MTcwLjIzMDM0MzY5MDgzMzE3fV0="
              data-id="edge2"
              data-et="edge"
              data-edge="true"
              style={{
                fill: "none",
              }}
              className={"edge-thickness-normal edge-pattern-solid transition " + stateActive['running']}
              id="edge2"
              fill="none"
              strokeWidth={1}
              stroke="#000"
              d="M221.35712878766742 155.15538844274792 C215.95617809977244 157.54293087963052, 210.57983930715287 158.00695331609717, 199.01350602320457 161.48995271440828 M221.77027899067556 155.51297156672146 C213.23801400540395 157.76740717031564, 204.421559016437 160.41664639320658, 198.7431930664564 161.42592722064688 M199.03667499401521 161.59889273939626 C185.286842071607 164.83602350567025, 170.91038250881357 167.46853193465117, 155.42155983024244 168.48449909197186 M198.67902080023157 161.97343207920866 C184.21166653335104 165.02574178235056, 169.81546430351685 167.8774514869572, 155.4898949220489 168.24373146496256 M155.6717248661329 168.29088706723755 C150.15928087673524 169.18582656139944, 145.4878892400595 169.43279413525016, 133.96367770854604 170.7123767499145 M155.48478875108208 168.7101570860688 C150.37383787926865 169.398288780799, 145.85969387121415 169.7532819235689, 133.4094270099097 170.2281688595472"
            />
            <path
              markerEnd="url(#fsmsvg_stateDiagram-barbEnd)"
              data-points="W3sieCI6Mjg3LjEwNDU3NDIwMzQ5MTIsInkiOjE1OS4xNjc1NzA2OTA1NzYyN30seyJ4IjozMzUuNDQzNjM3ODQ3OTAwNCwieSI6MTc3LjQ2NTU5OTUzNjg5NTc1fSx7IngiOjM4OS4zNzcxMTUyNDk2MzM4LCJ5IjoxOTQuNjQyNTUyNzE2MDEzMn1d"
              data-id="edge3"
              data-et="edge"
              data-edge="true"
              style={{
                fill: "none",
              }}
              className={"edge-thickness-normal edge-pattern-solid transition " + stateActive['running']}
              id="edge3"
              fill="none"
              strokeWidth={1}
              stroke="#000"
              d="M287.56428868975684 158.58193003369382 C293.2228272119062 160.7682112168879, 297.92649135625066 163.07891594022232, 311.3325269724483 168.83884299166002 M287.18825931144085 159.17281544213446 C292.74278936703496 161.45740382522848, 298.07256239903575 163.31759467394286, 311.1216630709114 168.4772794999727 M311.2741060256958 168.316585113736 C326.8714434301748 174.622640066318, 344.0527268036642 179.6808008953617, 360.5688043679363 184.82941153036865 M311.16948980174396 168.63376534247558 C326.99345138550444 174.8999466695403, 343.4344766203106 179.51563120269512, 359.7236864179667 185.24666428208104 M359.59735873028643 185.32006187530843 C369.5287364464332 188.01760365794544, 379.85065101443706 191.09235482599175, 389.39512072029464 194.74719724073026 M360.0467433456163 185.15935727629954 C371.5261900030088 188.9215268562446, 382.84447998469295 192.33311224461724, 389.4447240177474 194.68107425633488"
            />
            <path
              markerEnd="url(#fsmsvg_stateDiagram-barbEnd)"
              data-points="W3sieCI6MjY3Ljk1NDE5ODA2NTM3NDU2LCJ5IjoxMzAuNTQwNTAzNTAxODkyMX0seyJ4IjozMzUuNDQzNjM3ODQ3OTAwNCwieSI6NDkuMzM4MDU1MTMzODE5NTh9LHsieCI6Mzg0LjIzMjc1MTA3NTc3MDMsInkiOjc0LjM1MzgyNjk5OTY2NDN9XQ=="
              data-id="edge4"
              data-et="edge"
              data-edge="true"
              style={{
                fill: "none",
              }}
              className={"edge-thickness-normal edge-pattern-solid transition " + stateActive['running']}
              id="edge4"
              fill="none"
              strokeWidth={1}
              stroke="#000"
              d="M268.4496904118284 131.09247123399834 C289.87549060023554 104.45008442111246, 311.98597435806846 78.56454833448005, 330.6975511601868 56.07398348627542 M267.7662471069383 130.3858925909777 C291.5792946763896 102.60742634666356, 315.04604299239276 74.1637168674224, 330.2839406052666 55.484449446352414 M330.33299437942117 55.48711732360918 C334.1827114490505 51.499092119290424, 337.80919545722986 50.00019147938076, 342.7039557378295 52.69877571386745 M330.14172299702915 55.93615394631652 C333.37068818555673 50.77430664024675, 337.1946101400994 50.286377468846844, 343.0061650585099 52.860906145174944 M342.3001214319184 52.78954710971403 C356.74029169783677 59.69861910877447, 369.261618662221 67.01360075871058, 383.9346277303936 74.86311541220866 M342.7874956724148 53.254653566286294 C356.94709119084814 60.329995831555905, 370.8699579508397 67.5486432946584, 384.1704956198987 74.61023245444677"
            />
            <path
              markerEnd="url(#fsmsvg_stateDiagram-barbEnd)"
              data-points="W3sieCI6MjY0LjcwNTI3OTAyMTQ4MTI2LCJ5IjoxMzAuNTQwNTAzNTAxODkyMX0seyJ4IjozMzUuNDQzNjM3ODQ3OTAwNCwieSI6MTguNDk1MzEyNjkwNzM0ODYzfSx7IngiOjQxNS44MDg5OTYyMDA1NjE1LCJ5IjoxOC40OTUzMTI2OTA3MzQ4NjN9LHsieCI6NDg4LjM5Nzc5MjgxNjE2MjEsInkiOjE4LjQ5NTMxMjY5MDczNDg2M30seyJ4Ijo1NTYuMDUzOTM0ODM2NTgxLCJ5IjoxODIuMTAzMDAyMDcxMzgwNjJ9XQ=="
              data-id="edge5"
              data-et="edge"
              data-edge="true"
              style={{
                fill: "none",
              }}
              className={"edge-thickness-normal edge-pattern-solid transition " + stateActive['running']}
              id="edge5"
              fill="none"
              strokeWidth={1}
              stroke="#000"
              d="M264.2762374241529 130.96020098809848 C279.11951971732714 107.74743547942775, 293.7882962459437 84.73116090461409, 330.37281101269133 26.712758576344438 M264.98218971893505 130.59452887807322 C278.09223220167036 109.24119928858863, 291.51631044645296 88.43697506527354, 330.0809691121037 27.023400982123704 M329.91474964060956 27.252730086854832 C333.0309478531861 20.898461283002504, 339.44109767577 17.93504098827198, 345.7095988413889 18.67581546232951 M329.3212664771705 27.38374942744688 C333.10232305619604 21.381927264782405, 339.2173407294089 18.25206905604346, 345.4081738697211 18.788735409357322 M345.85258287501443 18.129115626525518 C364.809163191617 18.137671065131723, 383.4887470634203 18.29382028883532, 415.69267098287656 18.106415337366645 M345.60484896169686 18.361408286178897 C372.2571549880465 18.127355774693196, 399.0832233324597 18.64242591439113, 416.0459065074659 18.319950664146972 M416.39835168871514 18.300066551986287 C432.0723475169545 18.373055702422608, 448.1718970666147 18.774408043995958, 479.2479009676047 17.98310617073252 M415.5996396972256 18.635304634030398 C428.49556424323686 18.394207457958, 441.44287127676824 18.40496985840301, 479.46695160375424 18.72950272802914 M479.40197791890824 18.495312690734863 C485.7831415586284 18.92080018566905, 489.62730971194037 21.55124889585361, 491.2602190539199 26.359883402724783 M479.94264443258425 18.157532234732297 C485.38720480422427 17.98159078142548, 489.74223156802384 21.032062491462653, 491.6730188254317 27.1524395417878 M492.3586874157499 26.74322116884271 C504.52641777720953 57.98171371647091, 517.734933590247 89.09986250552471, 556.023007847907 181.52153992763812 M491.82000304109664 26.85749375328594 C516.8255813980591 88.21183473196018, 542.4580420594626 150.07744875086277, 555.8887410155213 182.14055214955303"
            />
            <path
              markerEnd="url(#fsmsvg_stateDiagram-barbEnd)"
              data-points="W3sieCI6MzgzLjc4MjcwMTQ5MjMwOTU3LCJ5Ijo4Ni40MTQxNzMxNjEyMzg1N30seyJ4IjozMzUuNDQzNjM3ODQ3OTAwNCwieSI6ODAuMTgwNzk3NTc2OTA0M30seyJ4IjoyNTQuNDM4NTY2MjA3ODg1NzQsInkiOjgwLjE4MDc5NzU3NjkwNDN9LHsieCI6MTc3LjY5OTExOTU2Nzg3MTEsInkiOjgwLjE4MDc5NzU3NjkwNDN9LHsieCI6MTE3LjA0Njk5OTg2NTk3NjAzLCJ5IjoxNTUuNjczOTU3ODI0NzA3MDN9XQ=="
              data-id="edge6"
              data-et="edge"
              data-edge="true"
              style={{
                fill: "none",
              }}
              className={"edge-thickness-normal edge-pattern-solid transition " + stateActive['paused']}
              id="edge6"
              fill="none"
              strokeWidth={1}
              stroke="#000"
              d="M384.1920420191311 86.22907392284645 C379.0147372977915 86.16740886721522, 373.5624998356991 85.06987131384614, 359.9610643251574 83.08065174270304 M383.7071455557016 86.12147121777689 C378.4234470340953 85.69322128265433, 373.1234501024152 85.12263813198473, 359.3213924856951 83.07068783419994 M359.613169670105 83.29748536907144 C343.72674498230435 81.13677941186593, 327.48032823831153 79.90618637123289, 311.16735578004744 80.3864703874237 M359.34895014213527 82.90099839473123 C343.07476337247607 80.68566897218109, 327.3064504737238 79.68023084154493, 310.39052283006345 80.02137508739939 M311.1074892443253 80.24440291896371 C296.4034656148557 80.59700798186923, 282.15600810822025 80.4224860948427, 254.99068135376288 80.48679251027004 M310.8638437473498 80.44870191998211 C295.3849154396173 80.5975275101805, 280.23851641981156 80.46061572259487, 254.67893903032672 80.42829585254164 M254.26292383605568 80.69436187739306 C238.00263100938298 80.39977038038916, 220.36066431877833 79.64375460920874, 189.69088631040594 80.03764265841873 M254.6845524581506 80.32684809988959 C232.2540872258874 80.06370228733948, 210.2800485680579 80.29412636992775, 189.48799829931653 80.46029733575767 M189.26643401887662 80.1807975769043 C181.73430122123472 80.3910278034624, 174.92226820661298 82.71796902693015, 170.58923437892994 89.52763022832706 M189.46382579384093 80.38392135350175 C181.7448483734908 79.54471483074573, 175.35060461209858 82.98612053901671, 170.0271165210695 88.91068568564457 M170.41743561251894 89.22314580987151 C149.46322267007764 114.39730642546203, 129.30158884855436 141.02396473477296, 117.14190222414715 155.09549751250094 M170.37973089882223 89.22377700667786 C154.43469763957984 109.1994730861921, 138.88015782340867 128.57231192604274, 116.84227485348944 155.73732752199945"
            />
            <path
              markerEnd="url(#fsmsvg_stateDiagram-barbEnd)"
              data-points="W3sieCI6NDQ3LjgzNTI5MDkwODgxMzUsInkiOjkwLjU0Mzk5OTE5NTA5ODg4fSx7IngiOjQ4OC4zOTc3OTI4MTYxNjIxLCJ5Ijo5MC41NDM5OTkxOTUwOTg4OH0seyJ4Ijo1NTEuNjA0NjQ4MzcyODY0NiwieSI6MTgyLjEwMzAwMjA3MTM4MDYyfV0="
              data-id="edge7"
              data-et="edge"
              data-edge="true"
              style={{
                fill: "none",
              }}
              className={"edge-thickness-normal edge-pattern-solid transition " + stateActive['paused']}
              id="edge7"
              fill="none"
              strokeWidth={1}
              stroke="#000"
              d="M447.56861541894966 90.2097949449781 C459.3969586322585 90.91824910305758, 470.88408932432475 90.91313151325164, 477.0708896496756 90.85051747613528 M448.10281354745996 90.52220228226012 C456.38927705951477 90.28888623483523, 464.89889237356164 90.6716784649221, 477.6063362895114 90.75378235020773 M477.6380747259137 90.54399919509888 C485.20724162570065 90.43515435558255, 489.87778940402177 93.39889695851184, 495.1031075354311 99.7772704673544 M477.4810641093253 90.82738788663441 C484.36296008560606 90.49269094201932, 490.05056105550307 93.45284489436186, 493.9166981537255 98.92558332231049 M493.9640836377264 99.567665562382 C513.3076275415777 125.28141709511188, 530.9146170740515 152.4011416426339, 551.7695785624785 182.49996522837483 M494.4692531167122 99.30653035810737 C512.2038035421394 125.1518798329231, 530.4773681761623 151.2827124333383, 551.8722629479504 181.8602363446157"
            />
            <path
              markerEnd="url(#fsmsvg_stateDiagram-barbEnd)"
              data-points="W3sieCI6Mzg3LjQ4MTA3NjA2ODIwNTU0LCJ5IjoxMDYuNzM0MTcxMzkwNTMzNDV9LHsieCI6MzM1LjQ0MzYzNzg0NzkwMDQsInkiOjEzNi40NzQ5NzQxNTU0MjYwM30seyJ4IjoyODcuMTA0NTc0MjAzNDkxMiwieSI6MTQyLjYzNzc0MDI4MTg1MjUzfV0="
              data-id="edge8"
              data-et="edge"
              data-edge="true"
              style={{
                fill: "none",
              }}
              className={"edge-thickness-normal edge-pattern-solid transition " + stateActive['paused']}
              id="edge8"
              fill="none"
              strokeWidth={1}
              stroke="#000"
              d="M387.0808827538492 106.60720932974057 C379.8988939050323 111.95033614475979, 371.4268518339353 115.47232385079057, 356.1411237538602 124.09869000501669 M387.7445022454733 106.69013102807287 C378.7936217165238 111.82880768540447, 370.2407630078556 116.39569512948387, 356.3010835277307 124.21695917090554 M356.59762661807275 124.38489767931391 C342.175245104265 133.02227206416103, 326.9370880261115 136.9543813065458, 310.7245948127801 139.95061603733504 M356.8626764580159 124.15573202804939 C342.9698966753263 133.02345553045893, 326.7559753724741 136.97138224100954, 311.147144966358 139.8759813400309 M311.85897781357045 139.33255191831057 C304.342913407668 139.94642555923053, 297.28667888358046 141.41699248060098, 287.35202032972285 143.10166328605348 M311.30998130983056 139.815153403026 C302.7473781048578 140.83527991329328, 294.3270712786455 141.85544680084462, 286.9723594421664 142.8648421412991"
            />
            <path
              markerEnd="url(#fsmsvg_stateDiagram-barbEnd)"
              data-points="W3sieCI6Mzg5LjM3NzExNTI0OTYzMzgsInkiOjIwNi40NjkxMDU4NDI3NDAwOH0seyJ4IjozMzUuNDQzNjM3ODQ3OTAwNCwieSI6MjEzLjQyMzg4NzI1MjgwNzYyfSx7IngiOjI1NC40Mzg1NjYyMDc4ODU3NCwieSI6MjEzLjQyMzg4NzI1MjgwNzYyfSx7IngiOjE3Ny42OTkxMTk1Njc4NzExLCJ5IjoyMTMuNDIzODg3MjUyODA3NjJ9LHsieCI6MTMzLjQ0MzQxOTM5MzUyMzA3LCJ5IjoxODguNzYxOTI4NTU4MzQ5Nn1d"
              data-id="edge9"
              data-et="edge"
              data-edge="true"
              style={{
                fill: "none",
              }}
              className={"edge-thickness-normal edge-pattern-solid transition " + stateActive['alarm']}
              id="edge9"
              fill="none"
              strokeWidth={1}
              stroke="#000"
              d="M389.1531471371092 206.53737626729708 C380.3464285955539 207.03233965223995, 370.7694436608763 209.06422358474586, 361.88605443700317 209.65781517454556 M389.19305605219483 206.2444637534045 C378.42597760418903 207.80436927455222, 367.902243318401 209.2649647029491, 362.2522151315813 209.89032409074542 M362.4103765487671 209.94649654777385 C344.74639003506195 212.7158818397291, 326.4544610463776 213.99012926917786, 308.04707645281525 213.05619860280214 M362.5585862505251 210.22178816233009 C345.00605552807826 212.40756355815753, 326.2646843506256 213.00368891610012, 308.418811784312 212.92235662189364 M308.49074779302356 213.53902027024887 C287.577181935763 212.9177932037323, 265.8466760804101 212.73982079698243, 254.72087172093984 213.5110201556686 M308.0774993909896 213.20136219913093 C287.4564026181204 213.52493591728876, 267.12005145621055 213.58379734831158, 254.2772017064881 213.64564753762264 M254.5701939145042 213.77933650828967 C242.21267124589622 213.61074032581217, 231.06174692817945 213.4875108431917, 198.03382711501834 213.87461504528284 M254.20018843463552 213.43193590662923 C234.87522307983244 213.44957935168833, 215.33866704796512 213.54301485983208, 197.62021654954148 213.72302049979572 M197.5820938236153 213.42388725280762 C184.05121145467297 213.78250798411318, 171.49451432942874 209.69457121425708, 160.89087205367184 203.24533337143976 M197.78535986195703 212.91738429144783 C184.3753781759819 213.5374456360646, 172.20603338262066 210.3511386252215, 159.67751494733656 203.90870283550785 M160.18191006853803 203.17612006331257 C151.9151075136691 199.34848590471805, 144.84594323548515 194.37355487491803, 133.08176906467006 188.20530725948578 M160.49587582353837 203.95037044769927 C151.32196527367242 198.57836982220786, 142.42862484288744 193.49731631456257, 133.3368447583118 188.5481816249489"
            />
            <path
              markerEnd="url(#fsmsvg_stateDiagram-barbEnd)"
              data-points="W3sieCI6NDQyLjI0MDg3NzE1MTQ4OTI2LCJ5IjoyMDMuMDYwNjg1NjM0NjEzMDR9LHsieCI6NDg4LjM5Nzc5MjgxNjE2MjEsInkiOjIwMy4wNjA2ODU2MzQ2MTMwNH0seyJ4Ijo1MjguOTYwMjk0NzIzNTEwNywieSI6MjAwLjM5NDIyMzk1NDM1NzkzfV0="
              data-id="edge10"
              data-et="edge"
              data-edge="true"
              style={{
                fill: "none",
              }}
              className={"edge-thickness-normal edge-pattern-solid transition " + stateActive['alarm']}
              id="edge10"
              fill="none"
              strokeWidth={1}
              stroke="#000"
              d="M442.27213217004277 203.16393900555371 C447.6460873614094 203.36317588137737, 454.27248178150205 203.19476442283758, 467.70959250192595 203.2272548518651 M441.97699010627053 203.2747519475131 C449.8467999669072 203.26257072742976, 457.306400030086 203.13433994033645, 467.9016164340979 202.8375209529229 M468.07276773083976 203.06068563461304 C481.586173204555 202.52724290517295, 495.238864026524 202.40965825678754, 509.07963501397535 201.71407729970937 M468.3697810360687 203.09800430569194 C482.03165330626894 203.13838192854323, 495.3114780371723 202.04486943617724, 508.9582974161473 202.1944875824642 M508.2203966858327 201.85563238333202 C516.6512245511128 201.68687965404663, 524.4746204968361 200.5742295558895, 528.9821466518214 199.85004836287902 M508.6717181706324 201.99119993657416 C513.1070502999569 201.1287521845554, 516.9699207388411 201.4294714692128, 528.7812959338137 200.64234324714056"
            />
            <path
              markerEnd="url(#fsmsvg_stateDiagram-barbEnd)"
              data-points="W3sieCI6NTQxLjQxNDQ1MTUwNTMwNTcsInkiOjIxNC4yNDk0NTk3NDM0OTk3Nn0seyJ4Ijo0ODguMzk3NzkyODE2MTYyMSwieSI6MjU0LjI4MjQwMTU2MTczNzA2fSx7IngiOjQxNS44MDg5OTYyMDA1NjE1LCJ5IjoyNTQuMjgyNDAxNTYxNzM3MDZ9LHsieCI6MzM1LjQ0MzYzNzg0NzkwMDQsInkiOjI1NC4yODI0MDE1NjE3MzcwNn0seyJ4IjoyNTQuNDM4NTY2MjA3ODg1NzQsInkiOjI1NC4yODI0MDE1NjE3MzcwNn0seyJ4IjoxNzcuNjk5MTE5NTY3ODcxMSwieSI6MjU0LjI4MjQwMTU2MTczNzA2fSx7IngiOjExOC42NjIyMzQ0NTY2MTA0MywieSI6MTg4Ljc2MTkyODU1ODM0OTZ9XQ=="
              data-id="edge11"
              data-et="edge"
              data-edge="true"
              style={{
                fill: "none",
              }}
              className={"edge-thickness-normal edge-pattern-solid transition " + stateActive['standby']}
              id="edge11"
              fill="none"
              strokeWidth={1}
              stroke="#000"
              d="M541.1520968224036 214.55573821125301 C527.5967552973414 224.20873880953738, 513.3420162910903 234.96527735179424, 501.0766593491268 245.21605182151296 M541.2953385149846 214.35374537432804 C526.0958807063666 225.75946337560768, 510.4516707752136 237.49572801161094, 500.98721948434036 244.64888304322366 M500.95461457663316 244.80073056646836 C492.53887929171924 251.4908682276152, 483.18109678475554 254.33490859468154, 472.77770146576944 254.7069951760303 M500.58308846509743 245.36472834990983 C492.03189857103956 250.67703462520274, 483.6753192030695 253.93578015391992, 472.0205730835294 253.74308438884356 M472.17016059177064 253.85710335996617 C457.914438778987 254.61875217803146, 443.52243646762474 254.25257836195962, 415.7717388096961 254.62556612013736 M472.47542092500044 254.22995440472639 C454.5382360107589 254.34987519456843, 436.40722315807574 254.5497724508221, 416.0781515976933 254.54838140394006 M415.320853921881 254.52478321421376 C397.9498657928422 254.7076093910977, 380.3649004567251 253.6923169588205, 335.044204745304 254.7301627850601 M415.7830153110657 254.28784371408008 C389.7345781091342 253.9190913347181, 363.3800204274437 253.941944097911, 335.26624436336294 254.4003413419916 M335.95801305917075 253.81176851912255 C302.9436356703708 254.4561762476249, 271.4883263835558 254.13525360986748, 254.76280555147497 254.25025837527673 M335.51312581645305 254.57682777375032 C318.8065105071966 254.3314695342013, 302.0285490919284 254.17449803477214, 254.22805600643957 254.30115488784787 M254.2052197324718 253.8665234089118 C231.2297676555052 254.6347786108421, 207.40400345789175 254.599147280487, 189.79112678470378 254.5533640602903 M254.6766609863927 254.40642385072383 C232.1399301371273 254.3684582236623, 210.22140700113758 253.87323523489934, 189.71683030478957 254.18920003905396 M189.99697245089055 254.28240156173706 C182.323461979889 253.81329220960163, 175.0915011857805 251.77029827651106, 169.6733269985621 244.66639817854445 M189.5142505681226 254.31880256180565 C182.16391067612312 253.9007903720254, 175.61171840653157 250.7290510893119, 169.42160241390337 245.10828772003686 M169.87534662441658 245.5018403923221 C155.6524006322491 228.6459249536261, 140.35248343946765 212.51443633048672, 118.07708790167759 189.3074938347528 M169.57437346459008 245.2728889627187 C158.80486781614627 233.4736370256668, 148.23994162277944 221.14493028777625, 118.92965520644826 189.0608318717148"
            />
            <path
              markerEnd="url(#fsmsvg_stateDiagram-barbEnd)"
              data-points="W3sieCI6NTQ4LjkxMDAzOTk5ODc0MywieSI6MjE0LjI0OTQ1OTc0MzQ5OTc2fSx7IngiOjQ4OC4zOTc3OTI4MTYxNjIxLCJ5IjoyODQuNzc3NzE0MjUyNDcxOX0seyJ4Ijo0MTUuODA4OTk2MjAwNTYxNSwieSI6Mjg0Ljc3NzcxNDI1MjQ3MTl9LHsieCI6MzM1LjQ0MzYzNzg0NzkwMDQsInkiOjI4NC43Nzc3MTQyNTI0NzE5fSx7IngiOjI2My45ODU4NjAxMDk2Nzk2NiwieSI6MTYzLjA2NDE4MTMyNzgxOTgyfV0="
              data-id="edge12"
              data-et="edge"
              data-edge="true"
              style={{
                fill: "none",
              }}
              className={"edge-thickness-normal edge-pattern-solid transition " + stateActive['standby']}
              id="edge12"
              fill="none"
              strokeWidth={1}
              stroke="#000"
              d="M549.1787015493576 214.6255624239565 C536.7038290516949 228.7593608610188, 522.9750920480342 243.6446439794479, 496.40407232311696 275.8619229177799 M548.6503893728145 214.0002701602264 C533.0456948710396 232.3668468810382, 517.2949581923978 250.61583717525681, 495.9678124157758 275.4199390868337 M496.19357585939287 275.69157060107597 C491.09981022835984 281.31560452856354, 484.496912610211 284.93128725014003, 476.54759266297486 284.8670263795634 M495.8807537640882 275.8993814599937 C491.6061449596094 282.35073991842995, 483.7266455657081 285.0354362790538, 476.2058669753233 284.42511061754243 M476.70242785206733 284.34507340606206 C462.14347156242576 284.66787288078865, 448.94598527335523 285.09500538853837, 415.26025033654616 285.24940842888725 M476.23563512669085 284.78414154418135 C457.77349451634257 285.05629686571535, 438.8582207964427 284.556871652841, 415.72372253344065 284.53977479687603 M415.600085215189 284.6004039873858 C399.7126888458004 284.3526148883528, 384.3193293973234 284.71143862361725, 345.2951212032043 284.7980589386538 M415.7065979744089 284.51871660145434 C394.31922752239507 284.35432054338344, 372.78324753297335 284.73861494180255, 345.4992627699577 284.57789153839377 M345.50715126179 284.7777142524719 C339.2016973384325 284.60715870157253, 334.27896813292443 281.62338168985065, 329.89019669591323 276.4240080166535 M345.0868869639113 284.95672857034566 C339.0437263003475 284.79334539800806, 333.7687620653827 282.3689827410616, 329.8334641611113 275.7448873328005 M330.80271734767706 276.4901147242684 C311.1537967538469 242.13445765236614, 290.8864612578051 209.21775624018693, 264.33541980764636 162.59593029432907 M330.40565805187646 276.00852110389803 C311.95840866793156 244.2596643798351, 293.3302091760492 212.53966410572525, 263.78096210837396 163.02697148006354"
            />
          </g>
          <g className="edgeLabels">
            <g className="edgeLabel">
              <g transform="translate(0, 0)" data-id="edge0" className="label">
                <foreignObject height={0} width={0}>
                  <div
                    className="labelBkg"
                    xmlns="http://www.w3.org/1999/xhtml"
                    style={{
                      display: "table-cell",
                      whiteSpace: "normal",
                      lineHeight: 1.5,
                      maxWidth: 200,
                      textAlign: "center",
                    }}
                  >
                    <span className="edgeLabel" />
                  </div>
                </foreignObject>
              </g>
            </g>
            <g
              transform="translate(177.6991195678711, 126.3070297241211)"
              className="edgeLabel"
            >
              <g
                transform="translate(-13.612500190734863, -10.495312690734863)"
                data-id="edge1"
                className="label"
              >
                <foreignObject
                  height={20.990625381469727}
                  width={27.225000381469727}
                >
                  <div
                    className="labelBkg"
                    xmlns="http://www.w3.org/1999/xhtml"
                    style={{
                      display: "table-cell",
                      whiteSpace: "normal",
                      lineHeight: 1.5,
                      maxWidth: 200,
                      textAlign: "center",
                    }}
                  >
                    <span className={"edgeLabel " + stateActive['setting']}>
                      <p>start</p>
                    </span>
                  </div>
                </foreignObject>
              </g>
            </g>
            <g
              transform="translate(177.6991195678711, 167.29765510559082)"
              className="edgeLabel"
            >
              <g
                transform="translate(-19.07343864440918, -10.495312690734863)"
                data-id="edge2"
                className="label"
              >
                <foreignObject
                  height={20.990625381469727}
                  width={38.14687728881836}
                >
                  <div
                    className="labelBkg"
                    xmlns="http://www.w3.org/1999/xhtml"
                    style={{
                      display: "table-cell",
                      whiteSpace: "normal",
                      lineHeight: 1.5,
                      maxWidth: 200,
                      textAlign: "center",
                    }}
                  >
                    <span className={"edgeLabel " + stateActive['running']}>
                      <p>delete</p>
                    </span>
                  </div>
                </foreignObject>
              </g>
            </g>
            <g
              transform="translate(335.4436378479004, 177.46559953689575)"
              className="edgeLabel"
            >
              <g
                transform="translate(-19.064064025878906, -10.495312690734863)"
                data-id="edge3"
                className="label"
              >
                <foreignObject
                  height={20.990625381469727}
                  width={38.12812805175781}
                >
                  <div
                    className="labelBkg"
                    xmlns="http://www.w3.org/1999/xhtml"
                    style={{
                      display: "table-cell",
                      whiteSpace: "normal",
                      lineHeight: 1.5,
                      maxWidth: 200,
                      textAlign: "center",
                    }}
                  >
                    <span className={"edgeLabel " + stateActive['running']}>
                      <p>expire</p>
                    </span>
                  </div>
                </foreignObject>
              </g>
            </g>
            <g
              transform="translate(335.4436378479004, 49.33805513381958)"
              className="edgeLabel"
            >
              <g
                transform="translate(-19.07343864440918, -10.495312690734863)"
                data-id="edge4"
                className="label"
              >
                <foreignObject
                  height={20.990625381469727}
                  width={38.14687728881836}
                >
                  <div
                    className="labelBkg"
                    xmlns="http://www.w3.org/1999/xhtml"
                    style={{
                      display: "table-cell",
                      whiteSpace: "normal",
                      lineHeight: 1.5,
                      maxWidth: 200,
                      textAlign: "center",
                    }}
                  >
                    <span className={"edgeLabel " + stateActive['running']}>
                      <p>pause</p>
                    </span>
                  </div>
                </foreignObject>
              </g>
            </g>
            <g
              transform="translate(415.8089962005615, 18.495312690734863)"
              className="edgeLabel"
            >
              <g
                transform="translate(-15.562501907348633, -10.495312690734863)"
                data-id="edge5"
                className="label"
              >
                <foreignObject
                  height={20.990625381469727}
                  width={31.125003814697266}
                >
                  <div
                    className="labelBkg"
                    xmlns="http://www.w3.org/1999/xhtml"
                    style={{
                      display: "table-cell",
                      whiteSpace: "normal",
                      lineHeight: 1.5,
                      maxWidth: 200,
                      textAlign: "center",
                    }}
                  >
                    <span className={"edgeLabel " + stateActive['running']}>
                      <p>reset</p>
                    </span>
                  </div>
                </foreignObject>
              </g>
            </g>
            <g
              transform="translate(254.43856620788574, 80.1807975769043)"
              className="edgeLabel"
            >
              <g
                transform="translate(-19.07343864440918, -10.495312690734863)"
                data-id="edge6"
                className="label"
              >
                <foreignObject
                  height={20.990625381469727}
                  width={38.14687728881836}
                >
                  <div
                    className="labelBkg"
                    xmlns="http://www.w3.org/1999/xhtml"
                    style={{
                      display: "table-cell",
                      whiteSpace: "normal",
                      lineHeight: 1.5,
                      maxWidth: 200,
                      textAlign: "center",
                    }}
                  >
                    <span className={"edgeLabel " + stateActive['paused']}>
                      <p>delete</p>
                    </span>
                  </div>
                </foreignObject>
              </g>
            </g>
            <g
              transform="translate(488.3977928161621, 90.54399919509888)"
              className="edgeLabel"
            >
              <g
                transform="translate(-15.562501907348633, -10.495312690734863)"
                data-id="edge7"
                className="label"
              >
                <foreignObject
                  height={20.990625381469727}
                  width={31.125003814697266}
                >
                  <div
                    className="labelBkg"
                    xmlns="http://www.w3.org/1999/xhtml"
                    style={{
                      display: "table-cell",
                      whiteSpace: "normal",
                      lineHeight: 1.5,
                      maxWidth: 200,
                      textAlign: "center",
                    }}
                  >
                    <span className={"edgeLabel " + stateActive['paused']}>
                      <p>reset</p>
                    </span>
                  </div>
                </foreignObject>
              </g>
            </g>
            <g
              transform="translate(335.4436378479004, 136.47497415542603)"
              className="edgeLabel"
            >
              <g
                transform="translate(-23.33906364440918, -10.495312690734863)"
                data-id="edge8"
                className="label"
              >
                <foreignObject
                  height={20.990625381469727}
                  width={46.67812728881836}
                >
                  <div
                    className="labelBkg"
                    xmlns="http://www.w3.org/1999/xhtml"
                    style={{
                      display: "table-cell",
                      whiteSpace: "normal",
                      lineHeight: 1.5,
                      maxWidth: 200,
                      textAlign: "center",
                    }}
                  >
                    <span className={"edgeLabel " + stateActive['paused']}>
                      <p>resume</p>
                    </span>
                  </div>
                </foreignObject>
              </g>
            </g>
            <g
              transform="translate(254.43856620788574, 213.42388725280762)"
              className="edgeLabel"
            >
              <g
                transform="translate(-19.07343864440918, -10.495312690734863)"
                data-id="edge9"
                className="label"
              >
                <foreignObject
                  height={20.990625381469727}
                  width={38.14687728881836}
                >
                  <div
                    className="labelBkg"
                    xmlns="http://www.w3.org/1999/xhtml"
                    style={{
                      display: "table-cell",
                      whiteSpace: "normal",
                      lineHeight: 1.5,
                      maxWidth: 200,
                      textAlign: "center",
                    }}
                  >
                    <span className={"edgeLabel " + stateActive['alarm']}>
                      <p>delete</p>
                    </span>
                  </div>
                </foreignObject>
              </g>
            </g>
            <g
              transform="translate(488.3977928161621, 203.06068563461304)"
              className="edgeLabel"
            >
              <g
                transform="translate(-13.232812881469727, -10.495312690734863)"
                data-id="edge10"
                className="label"
              >
                <foreignObject
                  height={20.990625381469727}
                  width={26.465625762939453}
                >
                  <div
                    className="labelBkg"
                    xmlns="http://www.w3.org/1999/xhtml"
                    style={{
                      display: "table-cell",
                      whiteSpace: "normal",
                      lineHeight: 1.5,
                      maxWidth: 200,
                      textAlign: "center",
                    }}
                  >
                    <span className={"edgeLabel " + stateActive['alarm']}>
                      <p>reset</p>
                    </span>
                  </div>
                </foreignObject>
              </g>
            </g>
            <g
              transform="translate(335.4436378479004, 254.28240156173706)"
              className="edgeLabel"
            >
              <g
                transform="translate(-19.07343864440918, -10.495312690734863)"
                data-id="edge11"
                className="label"
              >
                <foreignObject
                  height={20.990625381469727}
                  width={38.14687728881836}
                >
                  <div
                    className="labelBkg"
                    xmlns="http://www.w3.org/1999/xhtml"
                    style={{
                      display: "table-cell",
                      whiteSpace: "normal",
                      lineHeight: 1.5,
                      maxWidth: 200,
                      textAlign: "center",
                    }}
                  >
                    <span className={"edgeLabel " + stateActive['standby']}>
                      <p>delete</p>
                    </span>
                  </div>
                </foreignObject>
              </g>
            </g>
            <g
              transform="translate(415.8089962005615, 284.7777142524719)"
              className="edgeLabel"
            >
              <g
                transform="translate(-13.612500190734863, -10.495312690734863)"
                data-id="edge12"
                className="label"
              >
                <foreignObject
                  height={20.990625381469727}
                  width={27.225000381469727}
                >
                  <div
                    className="labelBkg"
                    xmlns="http://www.w3.org/1999/xhtml"
                    style={{
                      display: "table-cell",
                      whiteSpace: "normal",
                      lineHeight: 1.5,
                      maxWidth: 200,
                      textAlign: "center",
                    }}
                  >
                    <span className={"edgeLabel " + stateActive['standby']}>
                      <p>start</p>
                    </span>
                  </div>
                </foreignObject>
              </g>
            </g>
          </g>
          <g className="nodes">
            <g
              transform="translate(15.942521095275879, 172.21794319152832)"
              data-look="handDrawn"
              data-et="node"
              data-node="true"
              data-id="root_start"
              id="state-root_start-0"
              className={"node default"}
            >
              <g height={14} width={14} r={7} className="state-start">
                <path
                  fill="none"
                  strokeWidth={2}
                  stroke="#000000"
                  d="M2.4139030554555614 6.181002736594783 C2.4139030554555614 6.181002736594783, 2.4139030554555614 6.181002736594783, 2.4139030554555614 6.181002736594783 M2.4139030554555614 6.181002736594783 C2.4139030554555614 6.181002736594783, 2.4139030554555614 6.181002736594783, 2.4139030554555614 6.181002736594783 M7.738021686228847 -1.123090319588623 C4.032767198608818 1.026813265488824, 0.030340463260108586 2.3252333632341484, -3.6991512420156054 5.494268772062031 M7.490544172077828 -1.4059649514187915 C3.8261038735428863 1.2520064513681435, -0.48087864545562237 3.2732529908241275, -3.5232811694767756 5.035328930219146 M5.116445183724138 -5.5062650621292635 C2.1851762894486835 -2.165046411442362, -0.6563742077454945 -0.14965428497017874, -6.924811698572578 2.411294267789797 M5.318070141958622 -5.173447610732333 C2.1670207465356257 -2.6101416371298223, -1.3793643200280625 -0.616485019475166, -6.857039603837479 1.8169065843252492 M0.654398515311519 -7.187495207916037 C-3.3121904747377773 -4.933610649004286, -6.809183188217437 -2.1973199040979963, -7.995109518161094 -2.0185423063466805 M0.4254492170209465 -6.833458842886356 C-1.905446073972564 -5.444240504531415, -4.951452872983464 -3.545567165446142, -8.08008803140921 -2.0322280233331003"
                />
                <path
                  fill="none"
                  strokeWidth={1}
                  stroke="#000000"
                  d="M-0.45935056586260137 -6.129541963136122 C1.1025091134450018 -6.050333945734511, 3.8511751706397295 -5.665867345136094, 5.155861288519374 -4.714145006325382 C6.460547406399019 -3.76242266751467, 7.289217717749726 -1.790979325296364, 7.36876614141527 -0.4192079302718479 C7.448314565080813 0.9525634647526682, 6.437290576578278 2.428960453916563, 5.633151830512634 3.5164833638217137 C4.829013084446989 4.604006273726864, 4.032503777268682 5.635508412744674, 2.5439336650214024 6.105929529159054 C1.055363552774123 6.576350645573434, -1.7691543635218498 6.7080210092611745, -3.298268842971043 6.339010062307997 C-4.827383322420236 5.9699991153548195, -5.916687271801011 5.1054706296628325, -6.630753211673756 3.8918638474399896 C-7.344819151546502 2.6782570652171462, -7.9472058227691225 0.623105448953041, -7.582664482207516 -0.9426306310290631 C-7.2181231416459095 -2.508366711011167, -5.855422622050071 -4.435601035808715, -4.44350516830412 -5.502552632452636 C-3.031587714558169 -6.569504229096556, 0.08939460258806464 -7.149630162696203, 0.8888402402681883 -7.344340210892585 C1.6882858779483119 -7.539050259088967, 0.4333078065109624 -6.937909602445641, 0.35316865777662154 -6.670812921630929 M-1.1249139166378634 -6.851882217370864 C0.4458491549032777 -7.0375964258576715, 3.9202547684245763 -6.8736348023595095, 5.202124795744993 -6.093355358311886 C6.48399482306541 -5.313075914264262, 6.318462267826885 -3.6061000742630602, 6.566306247284636 -2.17020555308512 C6.814150226742387 -0.73431103190718, 7.297464556075329 1.0959326364738076, 6.689188672491498 2.5220117687557546 C6.080912788907667 3.948090901037702, 4.258852913826482 5.82232913496821, 2.916650945781652 6.386269240606563 C1.5744489777368216 6.9502093462449155, 0.02636837766329725 6.540466889080304, -1.3640231357774846 5.905652402585871 C-2.7544146492182664 5.2708379160914385, -4.2989525190605145 3.8018117741739346, -5.425698134863039 2.577382321639967 C-6.552443750665563 1.352952869106, -8.36996775269438 -0.06723737607009217, -8.12449683059263 -1.4409243126179316 C-7.879025908490879 -2.814611249165771, -5.217049292800096 -4.919794594084953, -3.952872602252536 -5.6647392976470705 C-2.688695911704975 -6.409684001209188, -1.273670519797303 -5.8378785451717174, -0.5394366873072644 -5.910592533990636 C0.19479714518277436 -5.9833065228095546, 0.3065931392775346 -5.900148579169368, 0.4525303926876958 -6.101023230560579"
                />
              </g>
            </g>
            <g
              transform="translate(103.75536155700684, 172.21794319152832)"
              data-look="handDrawn"
              data-et="node"
              data-node="true"
              data-id="setting"
              id="state-setting"
              className={"rough-node statediagram-state " + stateActive['setting']}
            >
              <g className="basic label-container">
                <path
                  strokeDasharray="0 0"
                  fill="none"
                  strokeWidth={4}
                  d="M-27.419877100757223 -13.23563156944861 C-27.419877100757223 -13.23563156944861, -27.419877100757223 -13.23563156944861, -27.419877100757223 -13.23563156944861 M-27.419877100757223 -13.23563156944861 C-27.419877100757223 -13.23563156944861, -27.419877100757223 -13.23563156944861, -27.419877100757223 -13.23563156944861 M-29.042502263613763 -5.335169739753767 C-25.71518231536872 -8.718245606465588, -21.5838962677265 -11.658156831251812, -20.431815323686024 -13.627612713591214 M-28.18168162224646 -4.636031273263208 C-25.072987227211303 -7.8973601138771325, -21.753097531506587 -11.477568487278095, -20.004637075629798 -14.3013217515051 M-26.35533783028235 2.330438574210071 C-22.657258219719665 -2.9824220971774418, -18.091496994061703 -10.105047336488697, -12.267598127736791 -15.552063533886693 M-27.857815673844083 2.0353637019697586 C-24.196874354203477 -1.2171055075394361, -21.757269792451705 -4.712831937539396, -13.179430875050901 -15.659987248656652 M-26.82260627291609 11.18586815411388 C-23.34446039899222 4.82758751546307, -16.19060952360484 -2.326775899017329, -5.579118092925138 -14.430214961803697 M-28.235279973352263 9.851549448017353 C-19.6415878078596 0.41894047809943247, -12.039267489957103 -8.262050313126663, -5.887475240059945 -14.601978047528673 M-24.475907597050305 13.855943713267465 C-16.826248811345764 3.691773718793494, -6.692971569921184 -8.08669619561237, -0.80598600722859 -14.476173172848792 M-26.058731949235913 15.434135045633035 C-18.047828336167623 7.089151891917856, -11.218715257335022 -2.0324314290848906, 0.21851560918625523 -14.949008662059342 M-18.59257552720511 16.542115995505167 C-11.469772549066173 5.499122118256241, -3.3833689786815127 -2.234607683031409, 5.595549969586317 -15.384194046550904 M-19.717781234656687 15.533211354443525 C-13.719733820701052 8.023650695389817, -8.023274467254842 2.396861255872008, 6.700703288884179 -13.557456702685911 M-12.011079605728082 15.146187003570489 C-1.6133062942366456 4.1083414202665764, 6.623029548903544 -8.288441694866773, 14.985509446368056 -15.191090100218041 M-12.49971260502889 14.611528139166543 C-5.858825151865074 7.337881228100739, 0.33879065529422503 -0.022617292680375645, 12.891319414801648 -15.112914505886511 M-4.6801881560504865 14.61646547899498 C4.014666269325036 3.724166097369228, 14.905134992370701 -7.225450484142027, 19.508614194169308 -15.407107462143586 M-4.991763369494568 15.14641235195234 C3.114526622708688 5.473854457246398, 12.233150929451343 -5.3492702642525, 20.59810574691611 -14.829843513732998 M0.09363468462033886 14.347083131871816 C9.95829534927274 3.6276169496953425, 17.669669284606933 -4.843071674071492, 26.505523085672586 -12.942971699769041 M1.34062560899959 14.865785467896016 C11.022869443867197 4.757675393329534, 20.808964710590935 -7.329908453324175, 26.604225433694577 -13.51046941652369 M7.699183550880604 15.202255422359576 C15.524232067713461 5.684770906182015, 24.85138365117528 -4.193148086476929, 29.940659892320976 -8.210682775284555 M8.149266630161826 14.495419272065217 C14.579152733722665 7.301717946739353, 22.05522145073432 -1.3628885888453934, 28.89963118617546 -9.218455837136975 M14.517153026961429 15.449519824794283 C17.690491526495105 11.492830550183458, 22.22309073516002 6.8802947305440165, 29.909123445199377 -1.1692139453857482 M14.047004044722623 15.341940429605435 C18.463683438137846 9.659259391183408, 23.45078132843433 4.839441404597729, 29.3515805281658 -1.2778115331526472 M20.211131005684415 15.158955613467809 C23.09412534689497 11.59650760219471, 26.552064215661296 8.022331589040716, 27.73559716387244 5.487494375497484 M21.006857447177723 15.700965480714908 C23.22725755674309 12.191760598734879, 26.90175086627021 8.29599440516667, 28.138002919407732 5.869709176521427"
                />
                <path
                  fill="none"
                  strokeWidth={1.3}
                  d="M-23.83878479915043 -14.986888336248112 C-6.594115163095729 -15.175605763573543, 7.747735748390204 -16.078566974102106, 24.792290630295405 -15.621285334318767 M-23.662947589847 -14.438757112150574 C-11.024356988868721 -15.695529199608462, 0.5946745252050175 -14.99574667380867, 23.673447632126333 -15.215605500475217 M23.625 -14.998437881469727 C26.68248913585159 -14.731778311684144, 29.8276202927594 -13.499148147617232, 29.42906583240177 -9.185063671868262 M22.306617301778946 -14.967663904159615 C25.579978147071397 -13.777075638445826, 27.959272020536975 -13.3643786097695, 28.00989206673438 -9.866093006509425 M29.0020430963483 -10.41380194671309 C30.082667449237498 -5.30597816967822, 28.500461538953502 -0.11781695003219839, 28.12640890109898 10.028760290116665 M28.716848098500677 -9.420547361079047 C28.23016038299571 -2.688193906144824, 28.707230078842045 4.242927669346689, 28.95272741179718 10.544118448967724 M28.625 9.998437881469727 C28.757675529292104 13.357686043345737, 26.33646074227859 14.280664094015734, 23.77224022884184 15.796098658372616 M29.79687517929773 8.926362537501022 C29.70409908440527 11.750656184600903, 27.461430117002216 14.068504487761322, 24.99070696482437 14.630635041878502 M23.428212237040736 15.041921668946095 C11.867565138545801 16.3198172315673, 0.12317167733120776 16.39634120573906, -24.05867540425312 16.26176864080784 M23.601784443278287 14.486623094920558 C5.538162369115153 14.483090079974069, -12.138380564443148 15.493118039954576, -23.341648896075895 14.605033727246354 M-23.625 14.998437881469727 C-26.642373799354864 15.778039735938524, -28.184243240022607 13.971490332270015, -29.253814191219984 8.918788134103867 M-24.439852611032272 14.756729978429398 C-25.491743323735186 16.040978163627983, -28.63435205701949 11.329012254656208, -28.373612226409435 11.568021529420982 M-28.361084695778096 11.165887959014688 C-29.405610860916788 5.963453686750599, -29.50049718777625 0.24218124175080757, -29.799977836698055 -10.720560232312993 M-29.05909058452774 9.736123108444474 C-28.81616186544027 4.007726429445077, -28.039543720868046 -1.0457682773130432, -28.11493042542449 -10.697588215306904 M-28.625 -9.998437881469727 C-29.994455157882307 -13.632963270962101, -26.238386733503543 -16.345595642539696, -24.560526096485578 -15.259613332143317 M-28.733778191501127 -9.110513139559353 C-29.885799502378905 -13.897540051337792, -27.071858833618514 -13.908075996926438, -23.67462929524106 -16.54585063022883 M-23.625 -14.998437881469727 C-23.625 -14.998437881469727, -23.625 -14.998437881469727, -23.625 -14.998437881469727 M-23.625 -14.998437881469727 C-23.625 -14.998437881469727, -23.625 -14.998437881469727, -23.625 -14.998437881469727"
                />
              </g>
              <g
                transform="translate(-20.625, -6.998437881469727)"
                style={{}}
                className="label"
              >
                <rect />
                <foreignObject height={13.996875762939453} width={41.25}>
                  <div
                    xmlns="http://www.w3.org/1999/xhtml"
                    style={{
                      display: "table-cell",
                      whiteSpace: "normal",
                      lineHeight: 1.5,
                      maxWidth: 200,
                      textAlign: "center",
                    }}
                  >
                    <span className="nodeLabel">
                      <p>{"setting"}</p>
                    </span>
                  </div>
                </foreignObject>
              </g>
            </g>
            <g
              transform="translate(254.43856620788574, 146.80234241485596)"
              data-look="handDrawn"
              data-et="node"
              data-node="true"
              data-id="running"
              id="state-running-12"
              className={"rough-node statediagram-state " + stateActive['running']}
            >
              <g className="basic label-container">
                <path
                  strokeDasharray="0 0"
                  fill="none"
                  strokeWidth={4}
                  d="M-29.627169935380742 -13.82938896371481 C-29.627169935380742 -13.82938896371481, -29.627169935380742 -13.82938896371481, -29.627169935380742 -13.82938896371481 M-29.627169935380742 -13.82938896371481 C-29.627169935380742 -13.82938896371481, -29.627169935380742 -13.82938896371481, -29.627169935380742 -13.82938896371481 M-30.096945461554824 -4.444111760344808 C-28.613161260125064 -8.608713040510692, -26.35632369910278 -10.33469843998173, -22.239334926418476 -15.700663345229827 M-30.243271917507396 -5.398453649154478 C-28.513981002086105 -7.769831773553848, -26.960707272869897 -9.818665597510009, -22.205442027319723 -14.769415035213326 M-30.272106022446124 2.0463093379229145 C-27.509247527888498 -1.0313824518456558, -23.22639740331316 -6.572637474595833, -15.157901657153086 -15.282190712134065 M-30.549294659865087 2.4440164764740606 C-26.15151709535902 -3.110815522192355, -20.765273759554663 -7.673120970635954, -15.984840105742515 -14.85752083197692 M-31.001471999536708 10.432051843118588 C-24.967123643988206 2.868180254878454, -17.916126836117666 -5.033267628465544, -7.818210587479079 -13.71425616684603 M-30.913176845224488 9.651558155020133 C-24.341322289875247 2.9082617929873362, -17.9578445080441 -4.130429472435454, -9.535910638839887 -14.633669830599564 M-28.241982302017032 15.703078537026562 C-21.248160182791512 6.458708194956939, -11.478742067482278 -3.526764055322034, -2.468671627447612 -14.983055518551897 M-27.91874458714544 15.148885532475626 C-20.525544495531175 6.67148626790085, -12.439490629707487 -3.204213639820617, -3.40096690300426 -13.686379193820706 M-22.646090073775493 14.595509916793302 C-12.1891422101358 5.4124546650777, -4.75297623489698 -3.9850124590826246, 4.181442347394578 -15.992436460648154 M-21.04431349832214 14.005681634512857 C-13.136467689015213 5.132076620120687, -4.420424801484179 -4.701795324311056, 4.638145129902722 -14.760461006586473 M-15.695451621002402 13.935704025786997 C-9.872251638464553 9.778067881796586, -4.1951309331129 2.9259611126007696, 10.925986676577303 -15.888077952329857 M-14.86867238572949 15.391340059620305 C-5.077184525137322 4.140011420129622, 4.279766260024735 -8.416766669228561, 11.421391664242373 -14.90963372764244 M-8.651186341600509 14.739345359267324 C-1.2895040030319034 6.795111922765043, 4.286190970709077 0.011295388781483284, 17.466882285190295 -14.034512391952612 M-8.773626948774318 14.84232033351151 C0.3066252813282364 4.847989576136471, 9.112702947185138 -5.704868490036561, 17.80703497701102 -14.398476555263926 M-1.1145699880391768 14.693793844076415 C6.994440195563913 4.67145142811375, 14.260166808884238 -1.9328124841575678, 23.166911046357406 -15.783637010411187 M-1.5174181985200286 14.305440536641964 C4.193313005227537 8.044306530350763, 9.637394463182112 1.9467886550391091, 23.69165407023826 -14.93156867476234 M4.124817709257511 16.18946857434849 C13.747806853540958 5.704374689102428, 21.082315592831257 -2.030219071610504, 30.156604333182965 -13.027683303891596 M4.806076457095527 15.024621837547981 C10.887986937969693 8.026693466877617, 16.872216525092277 1.2010094327813219, 28.9841114529914 -13.32724100020286 M10.761646715760621 14.287052302198754 C16.3847978342339 7.875900652816375, 22.738903106490035 2.467935576995263, 33.11966359780461 -7.612656161627114 M10.917733907057862 15.288042541444366 C16.25531600583965 10.606289524872631, 20.39496405286744 5.356438202913926, 32.3267191848766 -8.818472223394451 M16.985810434369608 15.851430353463156 C21.431748163132646 10.99635831968737, 26.905499014583505 4.972762728936097, 31.32672842902456 -1.2141830726918192 M18.47710956818013 15.698006331054472 C23.811810025574758 9.554047891854571, 28.027005562536772 2.6896219937998795, 32.04401700112762 0.18849699699520928 M24.535790799295146 15.276187703092829 C26.831840931544026 12.891312930116582, 27.35785938007302 12.51521824825576, 31.64321834586139 7.896263821835703 M25.0555509644711 15.027166501494621 C26.41499021854117 13.199629039781426, 27.677424795413362 11.840403697737425, 31.660676685365406 7.37347075763092"
                />
                <path
                  fill="none"
                  strokeWidth={1.3}
                  d="M-27.219442524580415 -16.05498041720062 C-5.887038091610741 -15.557839414888141, 16.142419325755583 -14.0083250230058, 25.858948516973722 -16.334206914959598 M-26.04044996661072 -14.86500824495199 C-12.063676327724167 -14.84048715528309, 1.8530989512517142 -14.169915166836532, 25.904823066245246 -14.664213878424977 M26.348438262939453 -14.998437881469727 C29.548190785079363 -14.7581159715553, 32.000495084605035 -13.971866257291866, 31.544964459225184 -9.171783145433183 M25.445974193271688 -14.481773994841355 C29.457854278741944 -13.913122099691765, 29.821283262865716 -13.719136015584983, 32.188134530957775 -9.694179931666046 M32.70336685949834 -11.054739245129682 C30.972783910342173 -4.201164209296508, 31.68693611425861 3.2727379270063155, 32.000576318263235 9.522342762884804 M31.838559073505813 -10.285440934029124 C31.765215101697997 -4.022581637663189, 31.07466363641561 1.0276853338765246, 31.913296105455608 9.354172454455146 M31.348438262939453 9.998437881469727 C32.510100019896676 11.418573996993958, 30.25401204113667 15.628377976746453, 27.174925854913837 15.940890056847023 M31.24414987940172 8.651869943249352 C31.100342747858967 13.832439355587598, 30.61205944539091 16.356744789920505, 27.752614495453948 15.11209947541469 M26.769169607991188 13.65711008570734 C12.409042487053366 15.437162620561132, -4.36763330840342 14.39657448177535, -26.82396039880269 14.877349491812964 M26.57942316248113 15.33084127336863 C15.4655925521224 15.496332405302038, 4.719429305903069 15.084827922574934, -26.45425363321389 14.571865056520036 M-26.348438262939453 14.998437881469727 C-28.27435952627781 15.042154475081205, -30.495406219240202 11.67835868150814, -31.888219950352966 10.405033253357194 M-25.513372050021875 14.517000797975985 C-28.663960567855426 16.54584750461711, -32.115515374488695 13.62145455112909, -31.86920143233218 9.720610724128829 M-30.780209397703103 11.075793685420278 C-31.620244596882564 2.0201287897172437, -32.05728068230943 -4.558588794099159, -32.21233595305484 -10.78615147112187 M-30.792717336078088 10.532917143960145 C-31.636070840135705 2.3752824799585754, -31.0862898760646 -5.695181947260632, -31.804987916073436 -10.091510402174489 M-31.348438262939453 -9.998437881469727 C-30.096050377423513 -11.723718898608775, -27.741466601603197 -14.279314986119527, -26.436944557910003 -14.304491541416823 M-30.927124346967048 -8.83514471693748 C-31.580063271536215 -12.0821499185531, -29.024189899205357 -16.578286466595237, -24.75981098101573 -13.754687115385906 M-26.348438262939453 -14.998437881469727 C-26.348438262939453 -14.998437881469727, -26.348438262939453 -14.998437881469727, -26.348438262939453 -14.998437881469727 M-26.348438262939453 -14.998437881469727 C-26.348438262939453 -14.998437881469727, -26.348438262939453 -14.998437881469727, -26.348438262939453 -14.998437881469727"
                />
              </g>
              <g
                transform="translate(-23.348438262939453, -6.998437881469727)"
                style={{}}
                className="label"
              >
                <rect />
                <foreignObject
                  height={13.996875762939453}
                  width={46.696876525878906}
                >
                  <div
                    xmlns="http://www.w3.org/1999/xhtml"
                    style={{
                      display: "table-cell",
                      whiteSpace: "normal",
                      lineHeight: 1.5,
                      maxWidth: 200,
                      textAlign: "center",
                    }}
                  >
                    <span className="nodeLabel">
                      <p>{"running"}</p>
                    </span>
                  </div>
                </foreignObject>
              </g>
            </g>
            <g
              transform="translate(415.8089962005615, 203.06068563461304)"
              data-look="handDrawn"
              data-et="node"
              data-node="true"
              data-id="alarm"
              id="state-alarm-10"
              className={"rough-node statediagram-state " + stateActive['alarm']}
            >
              <g className="basic label-container">
                <path
                  strokeDasharray="0 0"
                  fill="none"
                  strokeWidth={4}
                  d="M-24.329581682336435 -13.199304732978796 C-24.329581682336435 -13.199304732978796, -24.329581682336435 -13.199304732978796, -24.329581682336435 -13.199304732978796 M-24.329581682336435 -13.199304732978796 C-24.329581682336435 -13.199304732978796, -24.329581682336435 -13.199304732978796, -24.329581682336435 -13.199304732978796 M-25.866410737163363 -4.777690364079765 C-22.416706640988398 -6.206078799255643, -21.684832285159956 -8.994901047212752, -16.43007219120873 -14.66973786154577 M-24.97416398990283 -4.679359484782743 C-21.879581208000833 -8.769553727266238, -18.770659920698908 -12.553754213241886, -16.799521522662605 -14.404410942988662 M-23.943075134320473 1.3807018598441174 C-20.12661532127092 -5.147638475658619, -12.083083300851417 -11.581713832839656, -9.293529101234455 -14.622457767180975 M-25.18037781351092 2.3759320392018366 C-18.387591336868066 -4.026276010536024, -12.94102358334483 -10.94953936480567, -9.8899842284973 -14.921096133722058 M-24.20737816043296 9.535608739023393 C-19.277628841695673 4.092903309305049, -12.759910561027914 -1.8254861351941738, -2.966723636789573 -14.778074883488658 M-24.670485874511193 10.367292660466134 C-18.031467842622167 3.391164502123257, -11.565109992473264 -3.9096870159395536, -2.8024073276976074 -14.909362274265364 M-21.869286657579522 15.2861664493186 C-17.837636649040892 8.730075919470137, -11.723556406333676 0.43617943291518024, 4.108928140408149 -13.383063744647403 M-22.855737004384928 14.703284369249122 C-14.35646924987218 5.7079264226328075, -5.315136357865391 -3.353373918843645, 2.928069095875685 -14.649843822610588 M-15.051064317435827 13.146616241928232 C-5.46766101363143 2.7328721284282893, 3.366925969909375 -7.244079632725261, 10.276817193287755 -14.56478715947486 M-15.19007231200825 15.050381092023803 C-8.948128090903213 7.8643121965184735, -2.9745106696849244 1.0150389730163436, 9.058403699867215 -14.392899436251282 M-7.815428915155794 14.033556999595373 C1.08874699127802 3.474209533459079, 9.374347052936637 -7.436517528944571, 17.559044767680966 -14.55981125478065 M-8.662496316409701 15.002031722197867 C-0.9438786373488839 4.7418476755127825, 7.538700864096507 -3.862112442282719, 17.06894387036351 -14.332350501039562 M-3.532116401751045 13.959179395450626 C6.667156487827258 3.7394195910631556, 16.380885245877664 -4.520278953055159, 23.389672782082815 -14.284564759010275 M-2.199288663732063 14.866988924584227 C5.330790214335519 5.2678585441354, 14.902561480594446 -4.221323347632176, 22.6170074990083 -14.73795165349299 M4.442692476161709 15.036658688946625 C8.646880634678695 9.27191737644467, 15.273786815296743 1.7995674040549396, 26.136477466820853 -8.791731203330205 M3.70024005132076 15.566104884789384 C9.442692724802587 9.440217375953758, 13.69708960757438 3.026034007007549, 25.67754244464982 -9.668623986772166 M11.414634026198351 13.694346420470477 C16.8271651594378 8.317383131750036, 19.96291135962646 4.62799071544466, 26.695004248155374 -2.827502419139306 M10.808225569885744 15.419715225777079 C16.074276211659033 9.510275580347818, 20.87383246464099 4.026918051814198, 24.720640553977702 -1.536270712098768 M17.710033253015613 15.193538554258396 C19.06745019112733 12.83835798428064, 21.09435270754139 11.889003211748326, 24.80275462562547 5.784616767396611 M17.110747163660477 14.720500959242113 C19.786638372761654 12.145976638028527, 21.7477117535475 9.52786396462787, 24.969602806490947 6.142764945819348"
                />
                <path
                  fill="none"
                  strokeWidth={1.3}
                  d="M-19.2614636664192 -14.836670090610802 C-7.202464442588096 -15.13355308642654, 3.438358949531786 -14.296839964065027, 19.2359911193127 -14.495226066831808 M-21.106635018271902 -14.78888212976401 C-8.908098553145006 -15.290928723500219, 2.5175051622122155 -15.451620702341284, 20.55769494621293 -14.431312881992792 M20.50312614440918 -14.998437881469727 C22.882339634406875 -14.961731392470224, 24.491349979527644 -13.041869161977507, 26.47830891677448 -9.281118394174504 M21.407477481536255 -14.596162297841634 C22.024975735432758 -16.2873967831557, 23.903542794220602 -11.750023446560835, 25.27938157398251 -9.37885602522458 M26.829271896067517 -10.218594257284156 C24.451331383934377 -5.2529062283106835, 26.307022429235413 -1.1565875884518002, 26.10981397271609 10.19363158117446 M25.275405677140743 -9.312125898092525 C24.929423821141697 -5.891003803115075, 25.200636731268634 -1.510006672799153, 25.46679599875115 9.767664538941338 M25.50312614440918 9.998437881469727 C25.299474456382374 13.227716694487318, 23.100236959349356 15.605100440431814, 20.806553888739188 14.902676251712613 M25.453472383842502 11.102990585370108 C25.63260158096691 12.163886602852717, 22.077471298495613 16.58450365304033, 21.002545886923333 16.17661590320039 M19.975994841042255 16.18267157922297 C9.795307090526919 15.46204891027721, -0.8585004694991691 15.559031429321582, -20.31630452122221 15.860780012196972 M20.956436771099973 15.5746700550968 C7.214461198757101 15.07644295617832, -5.991847900994499 15.361905659025181, -20.06599881065564 14.540944441460777 M-20.50312614440918 14.998437881469727 C-22.52919595590202 16.22059083169687, -25.313502731788923 12.753686591403001, -25.573854865188586 9.338426809993056 M-21.145850912265455 14.323868526522416 C-23.38263635605278 15.845782954415244, -25.473018095499793 13.765730677738144, -25.58473137659154 8.96332785864629 M-25.376368852788808 10.051238280040643 C-26.553225361097613 6.7750501653330915, -26.109020398606855 0.680922307265099, -24.385129173415486 -9.637718162976146 M-25.445195175748196 10.289041925539015 C-26.121598775611577 3.5509721848385243, -25.719331304365305 -1.7251044175797074, -25.532346574501446 -9.805405864347824 M-25.50312614440918 -9.998437881469727 C-24.714988800641564 -12.626753013214111, -23.457075606752817 -13.908856866379034, -19.908865067693256 -16.24032040835144 M-24.145637790291246 -9.351790373832424 C-24.061065924267307 -11.889211304919352, -23.005666287288403 -15.08938970078162, -19.478178010823715 -15.76313200711986 M-20.50312614440918 -14.998437881469727 C-20.50312614440918 -14.998437881469727, -20.50312614440918 -14.998437881469727, -20.50312614440918 -14.998437881469727 M-20.50312614440918 -14.998437881469727 C-20.50312614440918 -14.998437881469727, -20.50312614440918 -14.998437881469727, -20.50312614440918 -14.998437881469727"
                />
              </g>
              <g
                transform="translate(-17.50312614440918, -6.998437881469727)"
                style={{}}
                className="label"
              >
                <rect />
                <foreignObject
                  height={13.996875762939453}
                  width={35.00625228881836}
                >
                  <div
                    xmlns="http://www.w3.org/1999/xhtml"
                    style={{
                      display: "table-cell",
                      whiteSpace: "normal",
                      lineHeight: 1.5,
                      maxWidth: 200,
                      textAlign: "center",
                    }}
                  >
                    <span className="nodeLabel">
                      <p>{"alarm"}</p>
                    </span>
                  </div>
                </foreignObject>
              </g>
            </g>
            <g
              transform="translate(415.8089962005615, 90.54399919509888)"
              data-look="handDrawn"
              data-et="node"
              data-node="true"
              data-id="paused"
              id="state-paused-8"
              className={"rough-node statediagram-state " + stateActive['paused']}
            >
              <g className="basic label-container">
                <path
                  strokeDasharray="0 0"
                  fill="none"
                  strokeWidth={4}
                  d="M-29.40823532232001 -13.63907200813219 C-29.40823532232001 -13.63907200813219, -29.40823532232001 -13.63907200813219, -29.40823532232001 -13.63907200813219 M-29.40823532232001 -13.63907200813219 C-29.40823532232001 -13.63907200813219, -29.40823532232001 -13.63907200813219, -29.40823532232001 -13.63907200813219 M-29.724737030513122 -5.4104428993282925 C-27.605924855007366 -6.608591835898276, -25.367732015225656 -9.398139326845236, -21.55090769421424 -15.184168281813946 M-30.14713454475398 -4.998920327884961 C-27.086330682998867 -9.279653859966317, -23.500459987593008 -12.748632168480794, -21.53063371832236 -15.05052843546241 M-30.662206740665184 2.150525302290318 C-23.549336436257683 -4.444124573539504, -17.301061454066378 -11.190080679628306, -14.354617224059654 -15.584060840027918 M-31.035045841850497 2.362725114315307 C-25.689155936484113 -3.322791727178719, -19.392495049226188 -9.675660293813875, -14.638445059906166 -14.85029311151414 M-30.445747924638816 9.727531346273636 C-25.958390219649175 5.2356348105962836, -18.826736203303664 -2.7388172524846137, -8.767644689738294 -13.718677924766762 M-29.983082470705664 10.16765214355092 C-24.64621558275655 3.9550881698273734, -19.465308304562512 -1.5062337380901312, -8.704001171296689 -14.280320431428676 M-28.268139613181045 15.708151998457874 C-16.0676089483811 3.2736586814783997, -7.395153919315266 -10.302812442885847, -2.4153526546708513 -15.314368186296377 M-26.904925719704973 14.387766776447492 C-18.31006315442109 4.547169140472835, -8.248569827339498 -6.88810398722754, -2.5018587295644004 -14.272812388053191 M-20.01191134512076 13.724164941677078 C-12.952916074247202 6.359238034808725, -4.453544616100048 -3.8600243866905237, 4.972014609689808 -14.65423795421906 M-20.360935985668892 14.507827834371348 C-15.309704154021267 8.99900056446132, -9.734035396336251 2.3247268997879957, 3.9665537599693854 -14.320256766078904 M-15.011977144636841 16.271455887908473 C-8.628084489464989 5.6737443955131415, -0.541856654007403 -1.801004843759805, 10.812216675929594 -14.484892387514469 M-14.211016021422907 15.717636075809473 C-6.247493006295878 6.8582962975747375, 0.9097168396914364 -2.166194780864238, 10.82861385773457 -14.736575985398703 M-8.268349647077796 14.155560261141478 C1.4515510574044308 2.613258483205004, 11.769673640677956 -7.926271218436856, 17.092285876172934 -15.142749809137996 M-7.556351422735996 14.10823871325407 C0.22811034791542778 5.335480004146731, 7.4791786690193955 -2.8892470481548296, 18.434672589623073 -15.268098692335967 M-1.6880555785931493 14.306320329655117 C4.247348474975368 7.131572312822167, 11.313598996030183 -1.2457634816855427, 23.17907246652638 -13.553257939559025 M-1.4906647034099518 14.27364665429465 C5.32178312273491 8.107489911723473, 10.511715042291538 0.32952948330707765, 24.38049938476578 -14.362837881760369 M4.175855776797032 14.9444543913207 C12.358045609160163 5.44867352156376, 20.412950241297427 -1.8979812542434722, 30.58108722051861 -11.955927843197047 M5.548154344419276 14.545932663580626 C11.715917430464636 8.798520980734201, 17.399638799164723 1.4565090483293834, 29.68060269162113 -12.263148620488451 M10.718786524868746 15.010729603474463 C17.74469642409389 8.056109327669908, 24.732858700586064 -0.2746723736568809, 30.23394103075836 -7.333468467684041 M11.255504544139972 15.390405634579672 C17.699616555257553 9.35495130065904, 22.947670107190433 2.1921872057999785, 31.176947904425347 -7.021880191006322 M18.992030382196404 15.242222338587695 C20.043529916591908 12.263422794010777, 24.868202491588143 7.67539155383699, 31.31772998187166 1.4559429462171798 M18.096997227420655 14.40819958856095 C22.86433401005489 10.568477385105469, 26.579021608749127 5.996162175603655, 31.351905460022465 0.1570779855355353 M25.32877495980662 15.645903601983944 C25.819665447005676 13.062879477054484, 27.970348135761473 12.001659798385896, 30.559943111687286 7.911956412995866 M25.027837380363838 14.93971187739623 C27.109996938386818 12.713256604866789, 29.219765510168834 10.202766974541056, 31.257011906352957 8.651175046857166"
                />
                <path
                  fill="none"
                  strokeWidth={1.3}
                  d="M-25.061433763293966 -13.962819441273352 C-7.457104893743235 -15.312839827957003, 12.848882418776823 -15.617872383724546, 26.24677202413297 -16.108887240086794 M-26.121228089671853 -15.023594034711195 C-6.689294575036771 -14.760196469277092, 12.582199709633729 -15.72846328591271, 26.027668751569863 -15.413104151750618 M25.96406364440918 -14.998437881469727 C28.212295746700967 -14.613991991987545, 32.19379139254431 -13.46709196221711, 29.94510327828985 -10.086897055889615 M27.225506146062198 -13.662004352476389 C30.314643487838705 -16.34291767303313, 31.540241907480436 -11.88920822021349, 30.29887101604138 -8.751919008002664 M32.111803427379854 -9.043482833913975 C31.227614805813385 -3.7820749797327333, 31.398664354673624 3.2014149456662873, 30.74214077152759 10.312718210243467 M31.235375907217634 -9.94393547493497 C30.944268967236173 -4.889021100610624, 31.125482947893556 0.4575690112147378, 31.439223360804657 10.437384508965918 M30.96406364440918 9.998437881469727 C31.263327723364 12.05966710196023, 27.363636349379206 16.14177173607242, 26.35474336215755 15.17609578264333 M30.277681334976254 10.069696583313666 C29.56360026049505 12.80787968586044, 27.313381210001214 15.414819642487553, 27.35892587185438 13.583189773198912 M27.09723245874317 15.207146054299344 C11.374239999122395 15.981790928482576, -1.4815923451364084 13.908168670527388, -26.39901494648732 15.283392981316329 M25.693608532750144 15.5653532728593 C10.525133984259968 15.752364614621154, -6.347515352104295 15.579137079518055, -25.29772539580893 15.383198116422047 M-25.96406364440918 14.998437881469727 C-27.47428920765541 15.25993243630878, -32.305683677273066 13.106039464091289, -30.599774058234242 10.401540487012847 M-26.376729046371832 15.362523114802059 C-29.057792243116847 15.09220521134374, -30.13770212122377 12.661392832404529, -31.460987239376667 9.358305326252417 M-31.861003998706238 10.856738561937327 C-32.09995026354872 2.612987134719966, -31.874813134967024 -2.4978718360058627, -30.175289234036253 -9.732945594853847 M-31.225954084966776 10.360643918477784 C-30.50055189891228 3.3068877962191117, -30.658380891169703 -3.5464957130367356, -31.14544677880432 -10.351608752537754 M-30.96406364440918 -9.998437881469727 C-29.923581405855167 -12.071100982202088, -28.425760580422896 -15.783713159021712, -26.282585282714873 -14.148381522052151 M-29.640358997819373 -9.692834640419079 C-31.75257105711629 -11.538579120588194, -27.517317471990474 -13.394073626717027, -25.269018277166058 -15.844694475916945 M-25.96406364440918 -14.998437881469727 C-25.96406364440918 -14.998437881469727, -25.96406364440918 -14.998437881469727, -25.96406364440918 -14.998437881469727 M-25.96406364440918 -14.998437881469727 C-25.96406364440918 -14.998437881469727, -25.96406364440918 -14.998437881469727, -25.96406364440918 -14.998437881469727"
                />
              </g>
              <g
                transform="translate(-22.96406364440918, -6.998437881469727)"
                style={{}}
                className="label"
              >
                <rect />
                <foreignObject
                  height={13.996875762939453}
                  width={45.92812728881836}
                >
                  <div
                    xmlns="http://www.w3.org/1999/xhtml"
                    style={{
                      display: "table-cell",
                      whiteSpace: "normal",
                      lineHeight: 1.5,
                      maxWidth: 200,
                      textAlign: "center",
                    }}
                  >
                    <span className="nodeLabel">
                      <p>{"paused"}</p>
                    </span>
                  </div>
                </foreignObject>
              </g>
            </g>
            <g
              transform="translate(562.7006435394287, 198.17623090744019)"
              data-look="handDrawn"
              data-et="node"
              data-node="true"
              data-id="standby"
              id="state-standby-12"
              className={`rough-node statediagram-state ${stateActive['standby']}`}
            >
              <g className="basic label-container">
                <path
                  strokeDasharray="0 0"
                  fill="none"
                  strokeWidth={4}
                  d="M-30.948045004499875 -13.652595150263352 C-30.948045004499875 -13.652595150263352, -30.948045004499875 -13.652595150263352, -30.948045004499875 -13.652595150263352 M-30.948045004499875 -13.652595150263352 C-30.948045004499875 -13.652595150263352, -30.948045004499875 -13.652595150263352, -30.948045004499875 -13.652595150263352 M-31.13380938526088 -5.652260356712281 C-29.21265348674911 -8.572697178596577, -27.288887003794574 -11.553569167218294, -23.300754958149696 -14.533561822342746 M-31.693272236021258 -5.452116812619699 C-28.641438704099404 -8.07228077684364, -25.827741066306785 -12.061142398573706, -23.571202685802536 -15.321607431725548 M-32.00630099490463 2.7059634634393417 C-28.999530873859182 -2.5617168994535104, -25.18276986905329 -5.296056180281565, -17.427162186473986 -14.094971269819723 M-31.89703516990206 3.1855795223471906 C-28.23181332721631 -0.5224103693518982, -24.791078262427146 -5.3279179520532125, -16.73167044197846 -14.14365902701091 M-32.922311497593576 11.53911118538495 C-25.278198760812273 3.4387254788715933, -21.108133232983526 -2.399699033131749, -9.59979709711876 -14.9154666459711 M-32.136796138269936 10.444603684153499 C-24.149948198946536 1.593007470600789, -15.677318332466267 -7.316999623995011, -10.182132920430139 -14.607532915228438 M-29.11235504442074 13.586354503095027 C-21.270165954638845 5.3221926072483585, -10.884769861804653 -5.69160098528575, -2.7833878049756526 -15.97280867908249 M-28.70153751022623 15.087004340835536 C-19.806811965389585 4.3080348130862465, -9.94051189103935 -7.053790135956153, -3.8222288149832266 -14.391622160972583 M-22.544300107465993 16.036670647062365 C-15.33677337158721 5.638561066446614, -7.2761449419162645 -1.361056112675953, 3.0331522445946755 -15.509324193528421 M-22.147251077620986 14.704705889283694 C-14.914657598497993 4.833470039912193, -5.6583418885548555 -3.910751094101673, 3.386167862555457 -15.235810710133048 M-15.534858515890761 15.13096656015351 C-11.252859359872355 10.204006327823171, -5.408255813612685 3.391897631091777, 8.822412592171727 -14.796520965909433 M-16.187475795703733 15.277098283174523 C-10.403957509734415 8.202838142145675, -5.302039243403859 2.6323003931899476, 10.103385394240597 -13.961381502615074 M-8.920924257830649 15.676884492261273 C1.4797300979598313 4.9789375888906795, 10.019624630793846 -6.741988693815537, 16.12702751999967 -15.587064564841505 M-9.585450196754907 14.55503378732768 C-3.554104088659511 7.640232402639615, 2.214388219517048 2.8067288526738547, 16.134917169035152 -14.708964456110673 M-3.3820541329996807 15.815348960579483 C6.747503028476809 4.045483702693228, 16.9593412950864 -7.292565678434345, 23.771341106003796 -15.696054250265128 M-3.3966442933640493 14.38528954658162 C5.257854897173519 5.87929556516569, 12.426297398211343 -2.9644243028445825, 23.126998766862926 -14.570391305155784 M3.5886759202505085 15.84242291460172 C13.426162816089823 4.1493760903181345, 22.401432805793895 -7.126806416112973, 30.3260278956937 -15.261500903047683 M4.0382470098744925 15.144736403484638 C12.10271077718972 5.999178217998105, 19.982029571832253 -4.789759552343353, 28.95388859521347 -14.24238777687664 M10.812206832865709 15.658473852709692 C17.290655292695195 6.426407743798314, 22.83600470522689 -1.1547696849184441, 31.885392186201482 -11.190816252060287 M9.473501402779918 15.755283798537402 C14.026048591809301 9.834208638566645, 18.872787777360553 4.585362768669301, 32.261932344469535 -10.24085610663601 M16.531148518668637 16.03054294746469 C21.417448293428635 9.455432832293921, 26.833648878751912 3.916693010197873, 33.06596876287384 -2.867204011388602 M17.0288868571372 14.249885817944826 C19.886393514967533 11.44874796404158, 24.40141540342738 6.665274494091235, 32.99560633689096 -3.8533947436664917 M23.638041984978347 14.261712489650193 C26.473966801157406 10.877539237951877, 29.883359678252752 9.302071197679334, 32.377272190885726 4.918751545410429 M23.29013879368446 14.701554346185821 C26.724883555140124 11.386788239638081, 29.994971548861702 7.8418207186193625, 32.65377146552411 5.021548052406104"
                />
                <path
                  fill="none"
                  strokeWidth={1.3}
                  d="M-28.804189882579774 -14.143388449919101 C-16.228009689813607 -15.194291346725127, -5.169270339617903 -15.808792236289039, 28.261611527782055 -14.256841713927653 M-27.489878807340702 -15.445946989046476 C-9.87042518651609 -15.601079313858433, 7.493256706243138 -15.251386768137731, 27.485391778775426 -15.05342857646663 M27.515628814697266 -14.998437881469727 C30.97667449310084 -14.592530781387772, 32.03476577553867 -12.393654546000326, 31.47624293791022 -9.161767997916302 M27.87723499823959 -14.627089385185135 C31.498670705949408 -16.41748633608918, 31.43981019364771 -14.241177990078201, 31.17318577209181 -11.500437230315372 M31.506010770901696 -11.370406888665645 C33.16473763008819 -4.5526449495387356, 32.9746098047964 1.920918651328889, 32.99995594226788 10.216200845599806 M31.840777705624227 -10.614344145279718 C32.15616507737683 -5.318080674177157, 32.9903143866815 -2.1372977466560794, 32.08253066492092 10.373179098764238 M32.515628814697266 9.998437881469727 C32.3400438869385 11.783960600514618, 31.33367376440135 15.909731797012377, 28.398483515291886 14.035379858804347 M33.58295058023111 10.75513643164718 C31.50095628813617 14.24508372012951, 31.202027664742612 13.859022090318643, 28.53230388575556 13.423941716116014 M26.213537190688523 15.335941991809808 C11.884591198524015 15.003155695799684, -4.161586608198835 15.15164664856548, -28.60945852560731 15.369020721659895 M27.912259815067884 14.43932970522625 C13.665649332865579 15.279942419901216, 0.940566011722118 15.682363675276635, -26.91745127003224 14.531200074657498 M-27.515628814697266 14.998437881469727 C-30.24644579008325 14.86133945593422, -33.46149497447412 14.068756967731169, -33.2545776424315 9.879451643516086 M-27.24043116845002 15.04697367784289 C-30.453439616592128 15.848487828152782, -31.15254347029821 12.15038429072353, -33.897748158911206 10.0680317771783 M-31.87345707675308 8.618790040353918 C-31.54376303530187 3.8753681459674283, -31.764094704941062 -2.670729663824313, -32.54197902944898 -11.366113683387416 M-31.864905059817836 10.021352258824406 C-31.907915295460132 4.057537772581634, -32.30871088953245 -1.2349150315618478, -31.955170840471986 -9.613530161815026 M-32.515628814697266 -9.998437881469727 C-33.753856707640445 -12.158141703999515, -30.84537332838751 -13.793963023348057, -28.30963761128304 -16.109787109527645 M-31.543897468666007 -10.70378378612938 C-32.76493278386129 -11.231940702885835, -30.31088932204986 -14.210808334614157, -28.365662610881046 -14.947908300192895 M-27.515628814697266 -14.998437881469727 C-27.515628814697266 -14.998437881469727, -27.515628814697266 -14.998437881469727, -27.515628814697266 -14.998437881469727 M-27.515628814697266 -14.998437881469727 C-27.515628814697266 -14.998437881469727, -27.515628814697266 -14.998437881469727, -27.515628814697266 -14.998437881469727"
                />
              </g>
              <g
                transform="translate(-24.515628814697266, -6.998437881469727)"
                style={{}}
                className="label"
              >
                <rect />
                <foreignObject
                  height={13.996875762939453}
                  width={49.03125762939453}
                >
                  <div
                    xmlns="http://www.w3.org/1999/xhtml"
                    style={{
                      display: "table-cell",
                      whiteSpace: "normal",
                      lineHeight: 1.5,
                      maxWidth: 200,
                      textAlign: "center",
                    }}
                  >
                    <span className="nodeLabel">
                      <p>{"standby"}</p>
                    </span>
                  </div>
                </foreignObject>
              </g>
            </g>
          </g>
        </g>
      </g>
      <defs>
        <filter width="130%" height="130%" id="drop-shadow">
          <feDropShadow
            floodColor="#FFFFFF"
            floodOpacity={0.06}
            stdDeviation={0}
            dy={4}
            dx={4}
          />
        </filter>
      </defs>
      <defs>
        <filter width="150%" height="150%" id="drop-shadow-small">
          <feDropShadow
            floodColor="#FFFFFF"
            floodOpacity={0.06}
            stdDeviation={0}
            dy={2}
            dx={2}
          />
        </filter>
      </defs>
      <linearGradient
        y2="0%"
        x2="100%"
        y1="0%"
        x1="0%"
        gradientUnits="objectBoundingBox"
        id="fsmsvg-gradient"
      >
        <stop
          stopOpacity={1}
          stopColor="hsl(78.1578947368, 18.4615384615%, 64.5098039216%)"
          offset="0%"
        />
        <stop
          stopOpacity={1}
          stopColor="hsl(98.961038961, 60%, 74.9019607843%)"
          offset="100%"
        />
      </linearGradient>
    </svg>
  
      <footer>
        <h3>
          <a href="https://github.com/tomByrer/state-shifter/blob/main/packages/simple-state-shifter/demos/02-countdown-timer.full.js"><svg height="32" aria-hidden="true" viewBox="0 0 24 24" version="1.1" width="32">
            <path d="M12.5.75C6.146.75 1 5.896 1 12.25c0 5.089 3.292 9.387 7.863 10.91.575.101.79-.244.79-.546 0-.273-.014-1.178-.014-2.142-2.889.532-3.636-.704-3.866-1.35-.13-.331-.69-1.352-1.18-1.625-.402-.216-.977-.748-.014-.762.906-.014 1.553.834 1.769 1.179 1.035 1.74 2.688 1.25 3.349.948.1-.747.402-1.25.733-1.538-2.559-.287-5.232-1.279-5.232-5.678 0-1.25.445-2.285 1.178-3.09-.115-.288-.517-1.467.115-3.048 0 0 .963-.302 3.163 1.179.92-.259 1.897-.388 2.875-.388.977 0 1.955.13 2.875.388 2.2-1.495 3.162-1.179 3.162-1.179.633 1.581.23 2.76.115 3.048.733.805 1.179 1.825 1.179 3.09 0 4.413-2.688 5.39-5.247 5.678.417.36.776 1.05.776 2.128 0 1.538-.014 2.774-.014 3.162 0 .302.216.662.79.547C20.709 21.637 24 17.324 24 12.25 24 5.896 18.854.75 12.5.75Z"></path>
          </svg>&nbsp; GitHub code for this State Machine at  
          github.com/tomByrer/state-shifter</a>
        </h3>
      </footer>

      <article id="timer">
        { (CT.machine.getState() === 'setting') &&
          <form onSubmit={handleSubmit} className="time-input">
            <h3>Input Countdown Time</h3>
            <div className="input-container">
              <input
                type="number"
                min="0"
                max="24"
                name="H"
                ref={formHrRef}
                placeholder="HH"
                value={time.HH}
                maxLength="2"
                onChange={storeNewTime}
              />
              <b>:</b>
              <input
                type="number"
                min="0"
                max="59"
                name="M"
                ref={formMinRef}
                placeholder="MM"
                value={time.MM}
                maxLength="2"
                onChange={storeNewTime}
              />
              <b>:</b>
              <input
                type="number"
                min="0"
                max="59"
                name="S"
                ref={formSecRef}
                placeholder="SS"
                value={time.SS}
                maxLength="2"
                onChange={storeNewTime}
              />
            </div>
            <button type="submit">▶️ Start</button>
          </form>
        }
        { (CT.machine.getState() !== 'setting') &&
          <div className="time-input">
            <h3>Countdown Timer</h3>

            { (CT.machine.getState() === 'running') &&
              <div className="display-time">
                <h4><i>running..</i></h4>
                <p>{time.HH +':'+ time.MM +':'+ time.SS}</p>
                <button onClick={()=>handleTrigger('delete')}>❌ Delete</button>
                <button onClick={()=>handleTrigger('pause')}>⏸️ Pause</button>
                <button onClick={()=>handleTrigger('reset')}>↩️ Reset</button>
              </div>
            }

            { (CT.machine.getState() === 'paused') &&
              <div className="display-time paused">
                <h4><i>Paused</i></h4>
                <p>{time.HH +':'+ time.MM +':'+ time.SS}</p>
                <button onClick={()=>handleTrigger('delete')}>❌ Delete</button>
                <button onClick={()=>handleTrigger('reset')}>↩️ Reset</button>
                <button onClick={()=>handleTrigger('resume')}>⏸️ Resume</button>
              </div>
            }

            { (CT.machine.getState() === 'alarm') &&
              <div className="display-time alarm">
                <h4><b>TIME IS UP!</b></h4>
                <p>{time.HH +':'+ time.MM +':'+ time.SS}</p>
                <button onClick={()=>handleTrigger('delete')}>❌ Delete</button>
                <button onClick={()=>handleTrigger('reset')}>↩️ Reset</button>
              </div>
            }

            { (CT.machine.getState() === 'standby') &&
              <div className="display-time alarm">
                <h4>(timer reset)</h4>
                <p>{time.HH +':'+ time.MM +':'+ time.SS}</p>
                <button onClick={()=>handleTrigger('delete')}>❌ Delete</button>
                <button onClick={()=>handleTrigger('start')}>▶️ Start</button>
              </div>
            }
          </div>
        }
      </article>

    </main>
    )
  }
export default App
