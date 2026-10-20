import { Fragment, useEffect, useState } from 'react'
import Gauge from '../components/Gauge'
import Thermometer, { RATING_LABEL } from '../components/Thermometer'
import { FACTORS, GROUPS, FACTOR_BY_ID } from '../data/factors'
import { ADVERSARIES, ESCALATION, TRENDS } from '../data/context'
import { LEVELS, SECTORS, levelOf, levelInfo, tightenAdvice } from '../lib/engine'
import logo from '../assets/college-logo.svg'

/* ════════════════════════════════════════════════════════════════
   פריסת הכיתה האימרסיבית: שלושה מסכים (3 × 3840×2160).
   הקנבס כאן הוא 5760×1080 יחידות עיצוב, כלומר 1920×1080 לכל מסך.
   כי האפליקציה בעברית (RTL): הילד הראשון = המסך הימני.
   ימין = right, אמצע = mid, שמאל = left.
   הרכיב הזה מוצג רק כש-App מזהה מצב "wide". בטוטם ובמסך רגיל לא נוגעים בו.
   ════════════════════════════════════════════════════════════════ */

const Logo = () => (
  <span className="logo-plate"><img src={logo} alt="המכללה הלאומית לאיתנות ישראלית" /></span>
)

const Title = () => (
  <div className="w-title">
    <strong>מצפן החלטות</strong>
    <small>מדיניות התגוננות לאוכלוסייה</small>
  </div>
)

const Steps = ({ steps, step }) =>
  step === undefined ? null : (
    <ol className="steps">
      {steps.map((s, i) => (
        <li key={s} className={i === step ? 'now' : i < step ? 'done' : ''}>
          <b>{i < step ? '✓' : i + 1}</b>{i === step && s}
        </li>
      ))}
    </ol>
  )

function Col({ top, bar, children }) {
  return (
    <div className="w-col">
      <div className="w-top">{top}</div>
      <div className="w-body">{children}</div>
      <div className="w-bar">{bar}</div>
    </div>
  )
}

/* כותרת של עמודה. ghost = רק שומר מקום כדי שהפאנלים בשלושת המסכים יתחילו באותו גובה */
const Head = ({ eyebrow, title, sub, ghost }) => (
  <div className={`w-head ${ghost ? 'ghost' : ''}`}>
    {eyebrow && <small className="eyebrow">{eyebrow}</small>}
    {title && <h2>{title}</h2>}
    {sub && <p>{sub}</p>}
  </div>
)

/* כפתורי הניווט – רק במסך האמצעי */
const Nav = ({ onBack, onNext, nextLabel, disabled, center }) => (
  <>
    <button className="btn-ghost" onClick={onBack}>חזרה</button>
    <div className="bar-count">{center}</div>
    <button className="btn-xl sm" disabled={disabled} onClick={onNext}>{nextLabel}</button>
  </>
)

/* ימין: לוגו · אמצע: כותרת ממורכזת למרכז כל התצוגה · שמאל: שלבים */
function Shell({ steps, step, fs, right, mid, left, bar, overlay }) {
  return (
    <div className="w-root">
      <Col top={<Logo />}>{right}</Col>
      <Col top={<Title />} bar={bar}>{mid}</Col>
      <Col top={<Steps steps={steps} step={step} />}>{left}</Col>
      {overlay}
    </div>
  )
}

/* ───────── פתיחה ───────── */
function WelcomeW({ sh, onStart }) {
  const [score, setScore] = useState(50)
  useEffect(() => {
    const id = setInterval(() => setScore(10 + Math.random() * 80), 2400)
    return () => clearInterval(id)
  }, [])
  return (
    <Shell {...sh}
      right={
        <div className="w-center w-welcome">
          <h1>איפה נקודת האיזון בין הצלת חיים לשגרה?</h1>
          <p className="lead">בחרו את הנתונים החשובים לכם, דרגו עד כמה כל אחד קריטי להחלטה, ותקבלו המלצה חזותית.</p>
        </div>
      }
      mid={
        <div className="w-center">
          <div className="w-gauge"><Gauge score={score} /></div>
          <button className="btn-xl w-pulse" onClick={onStart}>התחילו בבחירת נתונים</button>
        </div>
      }
      left={
        <div className="w-center">
          <h2 className="how-title">איך זה עובד?</h2>
          <ol className="how">
            <li><b>1</b>מגדירים את תמונת המצב</li>
            <li><b>2</b>בוחרים נתונים שחשובים להחלטה</li>
            <li><b>3</b>מדרגים עד כמה כל נתון קריטי</li>
            <li><b>4</b>מקבלים המלצה למדיניות התגוננות</li>
          </ol>
        </div>
      }
    />
  )
}

/* ───────── תמונת מצב 1: נקודת מוצא ───────── */
function ContextW({ sh, ctx, setCtx, onBack, onNext }) {
  const set = (patch) => setCtx({ ...ctx, ...patch })
  const toggleAdv = (a) =>
    set({ adversaries: ctx.adversaries.includes(a) ? ctx.adversaries.filter((x) => x !== a) : [...ctx.adversaries, a] })
  return (
    <Shell {...sh}
      right={<>
        <Head eyebrow="תמונת מצב · 1 מתוך 2" title="מאיפה אנחנו מתחילים?" sub="לפני שבוחנים שינוי במדיניות – מגדירים את נקודת המוצא." />
        <div className="panel w-fill">
          <h3>כמה זמן אנחנו במערכה?</h3>
          <div className="stepper">
            <button className="round" aria-label="פחות" onClick={() => set({ day: Math.max(1, ctx.day - 1) })}>−</button>
            <div className="day"><small>היום ה-</small><b>{ctx.day}</b><small>למערכה</small></div>
            <button className="round" aria-label="יותר" onClick={() => set({ day: Math.min(99, ctx.day + 1) })}>+</button>
          </div>
        </div>
      </>}
      mid={<>
        <Head ghost />
        <div className="panel w-fill">
          <h3>מול מי? <small>(אפשר לבחור כמה)</small></h3>
          <div className="chips-row">
            {ADVERSARIES.map((a) => (
              <button key={a} className={`pill ${ctx.adversaries.includes(a) ? 'on' : ''}`}
                aria-pressed={ctx.adversaries.includes(a)} onClick={() => toggleAdv(a)}>{a}</button>
            ))}
          </div>
        </div>
      </>}
      left={<>
        <Head ghost />
        <div className="panel w-fill">
          <h3>מהי מדיניות ההתגוננות הקודמת?</h3>
          <div className="levels">
            {[...LEVELS].reverse().map((l) => (
              <button key={l.id} className={`lvl ${ctx.prevLevel === l.id ? 'on' : ''}`}
                style={{ '--lvl': l.color }} aria-pressed={ctx.prevLevel === l.id}
                onClick={() => set({ prevLevel: l.id })}>
                <b>{l.id}</b>
                <span><strong>{l.name}</strong><small>{l.desc}</small></span>
              </button>
            ))}
          </div>
        </div>
      </>}
      bar={<Nav onBack={onBack} onNext={onNext} disabled={!ctx.prevLevel}
        nextLabel={ctx.prevLevel ? 'המשך' : 'בחרו מדיניות קודמת'} />}
    />
  )
}

/* ───────── תמונת מצב 3: האיום ───────── */
function ThreatW({ sh, ctx, setCtx, onBack, onNext }) {
  const ready = ctx.escalation && ctx.trend
  return (
    <Shell {...sh}
      right={
        <div className="w-center w-intro">
          <small className="eyebrow">תמונת מצב · 2 מתוך 2</small>
          <h2 className="w-intro-title">לאן האיום מתפתח?</h2>
          <p>הערכה שלכם לגבי הימים הקרובים.</p>
        </div>
      }
      mid={
        <div className="panel w-fill w-threat">
          <h3>מה מגמת האיום בימים האחרונים?</h3>
          <div className="trends">
            {TRENDS.map((t) => (
              <button key={t.id} className={`trend ${ctx.trend === t.id ? 'on' : ''}`}
                style={{ '--c': t.color }} aria-pressed={ctx.trend === t.id}
                onClick={() => setCtx({ ...ctx, trend: t.id })}>
                <span>{t.icon}</span><b>{t.label}</b>
              </button>
            ))}
          </div>
        </div>
      }
      left={
        <div className="panel w-fill w-threat">
          <h3>מה הסבירות להגברת האיום?</h3>
          <div className="esc">
            {ESCALATION.map((e) => (
              <button key={e.n} className={`esc-seg ${ctx.escalation >= e.n ? 'on' : ''} ${ctx.escalation === e.n ? 'top' : ''}`}
                style={{ '--c': e.color }} aria-pressed={ctx.escalation === e.n}
                onClick={() => setCtx({ ...ctx, escalation: e.n })}>
                <span className="esc-icon">{e.icon}</span>
                <b>{e.label}</b>
              </button>
            ))}
          </div>
        </div>
      }
      bar={<Nav onBack={onBack} onNext={onNext} disabled={!ready}
        nextLabel={ready ? 'לבחירת הנתונים' : 'השלימו את שני הנתונים'} />}
    />
  )
}

/* חלוקת הקטגוריות לשלושה מסכים: קטגוריה 1 → ימין, 2 → אמצע, 3 → שמאל */
const groupsPerScreen = () => [0, 1, 2].map((i) => GROUPS.filter((_, gi) => Math.min(gi, 2) === i))

/* ───────── בחירת נתונים ───────── */
function SelectW({ sh, selected, setSelected, onBack, onNext }) {
  const toggle = (id) => setSelected(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])
  const count = (g) => FACTORS.filter((f) => f.group === g.id && selected.includes(f.id)).length
  const [r, m, l] = groupsPerScreen().map((groups) =>
    groups.length === 0 ? <Head ghost /> : groups.map((g) => (
      <Fragment key={g.id}>
        <div className="w-head">
          <h2><span>{g.icon}</span> {g.name}{count(g) > 0 && <b className="w-badge">{count(g)}</b>}</h2>
          <p>סמנו את כל הנתונים שחשובים לכם בהחלטה.</p>
        </div>
        <div className="w-picks">
          {FACTORS.filter((f) => f.group === g.id).map((f) => {
            const on = selected.includes(f.id)
            return (
              <button key={f.id} className={`pick ${on ? 'on' : ''} ${f.lean > 0 ? 'protect' : 'routine'}`}
                aria-pressed={on} onClick={() => toggle(f.id)}>
                <span className="pick-icon">{f.icon}</span>
                <span className="pick-text"><strong>{f.label}</strong><small>{f.desc}</small></span>
                <span className="check">{on ? '✓' : ''}</span>
              </button>
            )
          })}
        </div>
      </Fragment>
    ))
  )
  return (
    <Shell {...sh} right={r} mid={m} left={l}
      bar={<Nav onBack={onBack} onNext={onNext} disabled={selected.length < 2}
        nextLabel={selected.length < 2 ? 'בחרו לפחות 2 נתונים' : 'המשך לדירוג'}
        center={<><b>{selected.length}</b> נתונים נבחרו
          {selected.length > 0 && <button className="link" onClick={() => setSelected([])}>נקה הכל</button>}</>} />}
    />
  )
}

/* ───────── דירוג קריטיות ───────── */
const SCALE = [
  { n: 5, color: '#D62839', label: 'קריטי' },
  { n: 4, color: '#E2692A', label: 'גבוה' },
  { n: 3, color: '#EBA52B', label: 'בינוני' },
  { n: 2, color: '#F2D030', label: 'נמוך' },
  { n: 1, color: '#2FA84F', label: 'שולי' },
]
const CAP = 12 // כמה מדחומים נכנסים במסך אחד (6 בשורה × 2 שורות). 3 מסכים = 36, מספיק לכל 32 הנתונים בלי גלילה

function RateW({ sh, selected, ratings, setRatings, onBack, onNext }) {
  const done = selected.filter((id) => ratings[id]).length
  const ready = selected.length > 0 && done === selected.length

  // עד 12 נתונים: כולם במסך האמצעי.
  // יותר מ-12: הזרימה מימין לשמאל (עברית): קודם המסך הימני, אחריו האמצעי, ואז השמאלי.
  const list = FACTORS.filter((f) => selected.includes(f.id))
  const overflow = list.length > CAP
  const rightList = overflow ? list.slice(0, CAP) : []
  const midList = overflow ? list.slice(CAP, CAP * 2) : list
  const leftList = overflow ? list.slice(CAP * 2) : []

  const card = (f) => {
    const v = ratings[f.id] || 0
    return (
      <article key={f.id} className={`w-vcard ${f.lean > 0 ? 'protect' : 'routine'} ${v ? 'rated' : ''}`}>
        <Thermometer value={v} name={f.label} onChange={(n) => setRatings({ ...ratings, [f.id]: n })} />
        <div className="vt">
          <span className="vt-icon">{f.icon}</span>
          <strong>{f.label}</strong>
          <small>{f.desc}</small>
          <span className={`chip ${f.lean > 0 ? 'red' : 'green'}`}>{f.lean > 0 ? 'מושך להתגוננות' : 'מושך לשגרה'}</span>
          <span className="vt-read">{v ? `${v} · ${RATING_LABEL[v]}` : 'טרם דורג'}</span>
        </div>
      </article>
    )
  }
  const grid = (arr) => <div className="w-vgrid">{arr.map(card)}</div>

  const legend = (
    <div className="panel w-fill w-legend">
      <h3>איך מדרגים?</h3>
      <div className="lg-list">
        {SCALE.map((x) => (
          <div className="lg-row" key={x.n}>
            <b className="lg-n" style={{ '--c': x.color }}>{x.n}</b>
            <span>{x.label}</span>
          </div>
        ))}
        <div className="lg-sep" />
        <div className="lg-row"><i className="lg-dot green" /><span>מושך לשגרה</span></div>
        <div className="lg-row"><i className="lg-dot red" /><span>מושך להתגוננות</span></div>
      </div>
    </div>
  )

  const progress = (
    <div className="panel w-fill w-progress">
      <h3>התקדמות הדירוג</h3>
      <div className="w-prog-num"><b>{done}</b><span>מתוך {selected.length}</span></div>
      <div className="progress"><i style={{ width: `${selected.length ? (100 * done) / selected.length : 0}%` }} /></div>
      <p>{ready ? 'הכול מדורג – אפשר להמשיך לעיבוד.' : 'דרגו את כל הנתונים כדי להמשיך.'}</p>
    </div>
  )

  const mainHead = <Head title="עד כמה כל נתון קריטי להחלטה?" sub="לחצו על המדחום: 1 – שולי, 5 – קריטי ביותר." />
  const more = <Head title="המשך הדירוג" sub="לחצו על המדחום: 1 – שולי, 5 – קריטי ביותר." />

  return (
    <Shell {...sh}
      right={overflow ? <>{mainHead}{grid(rightList)}</> : <><Head ghost />{legend}</>}
      mid={<>{overflow ? more : mainHead}{grid(midList)}</>}
      left={leftList.length ? <>{more}{grid(leftList)}</> : <><Head ghost />{progress}</>}
      bar={<Nav onBack={onBack} onNext={onNext} disabled={!ready}
        nextLabel={ready ? 'עיבוד נתונים' : 'דרגו את כל הנתונים'}
        center={<>
          <div className="progress"><i style={{ width: `${selected.length ? (100 * done) / selected.length : 0}%` }} /></div>
          דורגו <b>{done}</b> מתוך <b>{selected.length}</b></>} />}
    />
  )
}

/* ───────── עיבוד: הנתונים עפים אל ה-AI מכל שלושת המסכים ───────── */
const MESSAGES = ['קורא את הנתונים שבחרתם…', 'שוקל את רמת הקריטיות של כל נתון…', 'מאזן בין הצלת חיים לשגרה…', 'בונה המלצה לכל מגזר…']

function ProcessingW({ sh, items }) {
  const [m, setM] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setM((x) => (x + 1) % MESSAGES.length), 1100)
    return () => clearInterval(id)
  }, [])
  return (
    <Shell {...sh} right={null} mid={null} left={null}
      overlay={
        <div className="w-procfx">
          <div className="orbit">
            {items.map(({ factor }, i) => {
              const side = i % 2 === 0 ? 1 : -1                 // לסירוגין: מימין ומשמאל למרכז
              const x = side * (700 + ((i * 547) % 1950))        // 700–2650 יחידות מהמרכז = גם המסכים הצדדיים
              const y = (((i * 197) % 7) - 3) * 95               // פיזור אנכי
              return (
                <span key={factor.id}
                  className={`flyer ${factor.lean > 0 ? 'red' : 'green'}`}
                  style={{ '--x': `${x}px`, '--y': `${y}px`, '--d': `${(i % 12) * 0.22}s` }}>
                  {factor.icon} {factor.label}
                </span>
              )
            })}
            <div className="core"><span>AI</span></div>
          </div>
          <h2 className="proc-msg" key={m}>{MESSAGES[m]}</h2>
        </div>
      }
    />
  )
}

/* ───────── המלצה ───────── */
function ResultsW({ sh, result, items, ctx, onEdit, onRestart }) {
  const [score, setScore] = useState(0)
  useEffect(() => {
    // המחוג בדיוק באמצע הצבע של הרמה שהומלצה (12.5 / 37.5 / 62.5 / 87.5)
    const t = setTimeout(() => setScore((levelOf(result.score) - 1) * 25 + 12.5), 500)
    return () => clearTimeout(t)
  }, [result.score])
  const lvl = levelInfo(result.score)
  const sentence = String(result.paragraph).split(/\n+/).map((x) => x.trim()).filter(Boolean).join(' ').replace(/^לאחר עיבוד נתונים מעמיק,?\s*/, '')
  const tighten = result.tighten || tightenAdvice(result.sectors, ctx)
  const d = lvl.id - ctx.prevLevel

  return (
    <Shell {...sh}
      right={
        <div className="w-center">
          <div className="verdict" style={{ '--lvl': lvl.color }}>
            <Gauge score={score} activeLevel={lvl.id} />
            <div className="verdict-plate">
              <small>ההמלצה</small>
              <h2>{result.headline || lvl.headline}</h2>
              <span className="level-name">{lvl.name}</span>
            </div>
          </div>
        </div>
      }
      mid={
        <div className="w-center w-stack">
          <div className="analysis">
            <div className="analysis-head">
              <h3>עיבוד נתונים</h3>
              <span className={`src ${result.source}`}>{result.source === 'ai' ? '✦ בינה מלאכותית' : 'חישוב מקומי'}</span>
            </div>
            <p className="ai-line"><b>המלצת AI:</b> {sentence} {tighten}</p>
          </div>
          <div className="journey">
            <div className="j-chip" style={{ '--lvl': LEVELS[ctx.prevLevel - 1].color }}>
              <small>מדיניות קודמת</small><strong>{LEVELS[ctx.prevLevel - 1].name}</strong>
            </div>
            <span className="j-arrow">{d < 0 ? '⬅️ הקלה' : d > 0 ? '⬅️ החמרה' : '⬅️ ללא שינוי'}</span>
            <div className="j-chip" style={{ '--lvl': lvl.color }}>
              <small>המלצה</small><strong>{lvl.name}</strong>
            </div>
            <div className="j-meta">יום {ctx.day} למערכה{ctx.adversaries.length ? ` · ${ctx.adversaries.join(', ')}` : ''}</div>
          </div>
        </div>
      }
      left={
        <div className="w-sectors">
          {SECTORS.map((s) => {
            const sc = result.sectors[s.id]
            const l = levelOf(sc)
            const c = ctx.current?.[s.id]
            const dd = l - c
            return (
              <div className="sector" key={s.id} style={{ '--lvl': LEVELS[l - 1].color }}>
                <div className="sector-top">
                  <span className="sector-icon">{s.icon}</span>
                  <strong>{s.name}</strong>
                  <b className="sector-level">{LEVELS[l - 1].name}</b>
                </div>
                <div className="track"><i style={{ left: `${sc}%` }} /></div>
                <p>{s.actions[l - 1]}</p>
                <span className={`delta ${dd < 0 ? 'ease' : dd > 0 ? 'tight' : 'same'}`}>
                  {dd < 0 ? '⬇ הקלה' : dd > 0 ? '⬆ החמרה' : '＝ ללא שינוי'} · היום: {LEVELS[c - 1].name}
                </span>
              </div>
            )
          })}
        </div>
      }
      bar={<>
        <button className="btn-ghost" onClick={onEdit}>שינוי הדירוג</button>
        <span />
        <button className="btn-xl sm" onClick={onRestart}>התחלה מחדש</button>
      </>}
    />
  )
}

export default function WideApp(p) {
  const { screen, setScreen, ctx, setCtx, selected, setSelected, ratings, setRatings, items, result, run, restart, goState, steps, step, fs } = p
  const sh = { steps, step, fs }
  switch (screen) {
    case 'welcome':
      return <WelcomeW sh={sh} onStart={() => setScreen('context')} />
    case 'context':
      return <ContextW sh={sh} ctx={ctx} setCtx={setCtx} onBack={restart} onNext={() => goState('threat')} />
    case 'state': // לא בשימוש בכיתה האימרסיבית
    case 'threat':
      return <ThreatW sh={sh} ctx={ctx} setCtx={setCtx} onBack={() => setScreen('context')} onNext={() => setScreen('select')} />
    case 'select':
      return <SelectW sh={sh} selected={selected} setSelected={setSelected} onBack={() => setScreen('threat')} onNext={() => setScreen('rate')} />
    case 'rate':
      return <RateW sh={sh} selected={selected} ratings={ratings} setRatings={setRatings} onBack={() => setScreen('select')} onNext={run} />
    case 'processing':
      return <ProcessingW sh={sh} items={items} />
    case 'results':
      return result ? <ResultsW sh={sh} result={result} items={items} ctx={ctx} onEdit={() => setScreen('rate')} onRestart={restart} /> : null
    default:
      return null
  }
}