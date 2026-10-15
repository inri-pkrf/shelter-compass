import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Welcome from './screens/Welcome'
import SelectFactors from './screens/SelectFactors'
import RateFactors from './screens/RateFactors'
import Processing from './screens/Processing'
import Results from './screens/Results'
import { FACTOR_BY_ID } from './data/factors'
import { analyze } from './lib/ai'

const W = 1080, H = 1920
const IDLE_MS = 120000 // 2 דקות ללא מגע → אזהרה
const WARN_S = 15
const STEPS = ['בחירת נתונים', 'דירוג קריטיות', 'עיבוד', 'המלצה']
const STEP_OF = { select: 0, rate: 1, processing: 2, results: 3 }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// הקנבס קבוע ל-1080×1920 ומוקטן לגודל החלון (נוח לפיתוח על מסך רגיל)
function useFit() {
  const [s, setS] = useState(1)
  useEffect(() => {
    const f = () => setS(Math.min(window.innerWidth / W, window.innerHeight / H))
    f()
    window.addEventListener('resize', f)
    return () => window.removeEventListener('resize', f)
  }, [])
  return s
}

export default function App() {
  const scale = useFit()
  const [screen, setScreen] = useState('welcome')
  const [selected, setSelected] = useState([])
  const [ratings, setRatings] = useState({})
  const [result, setResult] = useState(null)
  const [warn, setWarn] = useState(null) // שניות לאיפוס

  const items = useMemo(
    () => selected.map((id) => ({ factor: FACTOR_BY_ID[id], rating: ratings[id] || 3 })),
    [selected, ratings]
  )

  const restart = useCallback(() => {
    setSelected([]); setRatings({}); setResult(null); setWarn(null); setScreen('welcome')
  }, [])

  const run = async () => {
    setScreen('processing')
    const [res] = await Promise.all([analyze(items), sleep(4400)])
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

  return (
    <div className="viewport" onContextMenu={(e) => e.preventDefault()}>
      <div className="stage" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        <header className="top">
          <div className="brand">
            <span className="brand-mark">◐</span>
            <div><strong>מצפן החלטות</strong><small>מדיניות התגוננות לאוכלוסייה</small></div>
          </div>
          {step !== undefined && (
            <ol className="steps">
              {STEPS.map((s, i) => (
                <li key={s} className={i === step ? 'now' : i < step ? 'done' : ''}><b>{i + 1}</b>{s}</li>
              ))}
            </ol>
          )}
        </header>

        <main>
          {screen === 'welcome' && <Welcome onStart={() => setScreen('select')} />}
          {screen === 'select' && (
            <SelectFactors selected={selected} setSelected={setSelected}
              onBack={restart} onNext={() => setScreen('rate')} />
          )}
          {screen === 'rate' && (
            <RateFactors selected={selected} ratings={ratings} setRatings={setRatings}
              onBack={() => setScreen('select')} onNext={run} />
          )}
          {screen === 'processing' && <Processing items={items} />}
          {screen === 'results' && result && (
            <Results result={result} items={items} onEdit={() => setScreen('rate')} onRestart={restart} />
          )}
        </main>

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
