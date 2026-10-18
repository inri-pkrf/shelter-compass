import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Welcome from './screens/Welcome'
import Context from './screens/Context'
import CurrentState from './screens/CurrentState'
import Threat from './screens/Threat'
import SelectFactors from './screens/SelectFactors'
import RateFactors from './screens/RateFactors'
import Processing from './screens/Processing'
import Results from './screens/Results'
import { FACTOR_BY_ID } from './data/factors'
import { analyze } from './lib/ai'
import { initialContext } from './data/context'
import logo from './assets/college-logo.svg'
import WideApp from './wide/WideApp'

const W = 1080
const IDLE_MS = 120000 // 2 דקות ללא מגע → אזהרה
const WARN_S = 15
const STEPS = ['תמונת מצב', 'בחירת נתונים', 'דירוג קריטיות', 'עיבוד', 'המלצה']
const STEP_OF = { context: 0, state: 0, threat: 0, select: 1, rate: 2, processing: 3, results: 4 }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// קנבס רספונסיבי שממלא את כל המסך (בלי פסים שחורים):
//  • מסך אנכי (טוטם 1080×1920): רוחב עיצוב 1080
//  • מסך אופקי (16:9, למשל 3840×2160): גובה עיצוב 1080, רוחב 1920
//  • שלושה מסכים (11520×2160): גובה עיצוב 1080, רוחב 5760
function useFit() {
  const calc = () => {
    const vw = window.innerWidth, vh = window.innerHeight
    const portrait = vw < vh
    const s = portrait ? vw / W : vh / 1080
    const dw = portrait ? W : vw / s
    const dh = portrait ? vh / s : 1080
    const mode = portrait ? 'portrait' : dw / dh > 3 ? 'landscape wide' : 'landscape'
    return { s, dw, dh, mode }
  }
  const [fit, setFit] = useState(calc)
  useEffect(() => {
    const f = () => setFit(calc())
    window.addEventListener('resize', f)
    return () => window.removeEventListener('resize', f)
  }, [])
  return fit
}

export default function App() {
  const fit = useFit()
  const [screen, setScreen] = useState('welcome')
  const [selected, setSelected] = useState([])
  const [ratings, setRatings] = useState({})
  const [result, setResult] = useState(null)
  const [ctx, setCtx] = useState(initialContext)
  const [warn, setWarn] = useState(null) // שניות לאיפוס

  const items = useMemo(
    () => selected.map((id) => ({ factor: FACTOR_BY_ID[id], rating: ratings[id] || 3 })),
    [selected, ratings]
  )

  const restart = useCallback(() => {
    setSelected([]); setRatings({}); setResult(null); setCtx(initialContext()); setWarn(null); setScreen('welcome')
  }, [])

  // מעבר מ"נקודת מוצא" ל"המצב בפועל": מילוי מראש לפי המדיניות הקודמת (אם לא תוקן ידנית)
  const goState = () => {
    if (!ctx.currentTouched) {
      const all = { essential: ctx.prevLevel, work: ctx.prevLevel, gather: ctx.prevLevel, edu: ctx.prevLevel }
      setCtx({ ...ctx, current: all })
    } else if (!ctx.current) setCtx({ ...ctx })
    setScreen('state')
  }

  const run = async () => {
    setScreen('processing')
    const [res] = await Promise.all([analyze(items, ctx), sleep(4400)])
    setResult(res)
    setScreen('results')
  }

  // ── איפוס אוטומטי כשאין פעילות (טוטם ציבורי) ──
  const lastTouch = useRef(Date.now())
  useEffect(() => {
    const bump = () => { lastTouch.current = Date.now(); setWarn(null) }
    window.addEventListener('pointerdown', bump)
    return () => window.removeEventListener('pointerdown', bump)
  }, [])
  useEffect(() => {
    const id = setInterval(() => {
      if (screen === 'welcome' || screen === 'processing') return
      const idle = Date.now() - lastTouch.current
      if (idle > IDLE_MS + WARN_S * 1000) restart()
      else if (idle > IDLE_MS) setWarn(Math.ceil((IDLE_MS + WARN_S * 1000 - idle) / 1000))
    }, 500)
    return () => clearInterval(id)
  }, [screen, restart])

  const step = STEP_OF[screen]
  const wide = fit.mode.includes('wide') // כיתה אימרסיבית (3 מסכים) בלבד

  return (
    <div className="viewport" onContextMenu={(e) => e.preventDefault()}>
      <div className={`stage ${fit.mode}`} style={{ width: fit.dw, height: fit.dh, transform: `scale(${fit.s})` }}>
        {wide ? (
          <main className="wide-main">
            <WideApp
              screen={screen} setScreen={setScreen} ctx={ctx} setCtx={setCtx}
              selected={selected} setSelected={setSelected} ratings={ratings} setRatings={setRatings}
              items={items} result={result} run={run} restart={restart} goState={goState}
              steps={STEPS} step={step}
            />
          </main>
        ) : (
          <>
            <header className="top">
              <div className="brand">
                <span className="logo-plate"><img src={logo} alt="המכללה הלאומית לאיתנות ישראלית" /></span>
                <div><strong>מצפן החלטות</strong><small>מדיניות התגוננות לאוכלוסייה</small></div>
              </div>
              {step !== undefined && (
                <ol className="steps">
                  {STEPS.map((s, i) => (
                    <li key={s} className={i === step ? 'now' : i < step ? 'done' : ''}><b>{i < step ? '✓' : i + 1}</b>{i === step && s}</li>
                  ))}
                </ol>
              )}
            </header>

            <main>
              {screen === 'welcome' && <Welcome onStart={() => setScreen('context')} />}
              {screen === 'context' && (
                <Context ctx={ctx} setCtx={setCtx} onBack={restart} onNext={goState} />
              )}
              {screen === 'state' && ctx.current && (
                <CurrentState ctx={ctx} setCtx={setCtx} onBack={() => setScreen('context')} onNext={() => setScreen('threat')} />
              )}
              {screen === 'threat' && (
                <Threat ctx={ctx} setCtx={setCtx} onBack={() => setScreen('state')} onNext={() => setScreen('select')} />
              )}
              {screen === 'select' && (
                <SelectFactors selected={selected} setSelected={setSelected}
                  onBack={() => setScreen('threat')} onNext={() => setScreen('rate')} />
              )}
              {screen === 'rate' && (
                <RateFactors selected={selected} ratings={ratings} setRatings={setRatings}
                  onBack={() => setScreen('select')} onNext={run} />
              )}
              {screen === 'processing' && <Processing items={items} />}
              {screen === 'results' && result && (
                <Results result={result} items={items} ctx={ctx} onEdit={() => setScreen('rate')} onRestart={restart} />
              )}
            </main>
          </>
        )}

        {warn !== null && (
          <div className="overlay" onPointerDown={() => setWarn(null)}>
            <div className="dialog">
              <h2>עדיין כאן?</h2>
              <p>המסך יתאפס בעוד <b>{warn}</b> שניות.</p>
              <button className="btn-xl sm">אני ממשיך</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}