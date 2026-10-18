import { Fragment, useEffect, useState } from 'react'
import Gauge from '../components/Gauge'
import Thermometer, { RATING_LABEL } from '../components/Thermometer'
import Processing from '../screens/Processing'
import { FACTORS, GROUPS, FACTOR_BY_ID } from '../data/factors'
import { ADVERSARIES, ESCALATION, TRENDS } from '../data/context'
import { LEVELS, SECTORS, levelOf, levelInfo } from '../lib/engine'
import logo from '../assets/college-logo.svg'

/* ════════════════════════════════════════════════════════════════
   פריסת הכיתה האימרסיבית: שלושה מסכים (3 × 3840×2160).
   הקנבס כאן הוא 5760×1080 יחידות עיצוב, כלומר 1920×1080 לכל מסך.
   כי האפליקציה בעברית (RTL): הילד הראשון = המסך הימני.
   ימין = right, אמצע = mid, שמאל = left.
   הרכיב הזה מוצג רק כש-App מזהה מצב "wide". בטוטם ובמסך רגיל לא נוגעים בו.
   ════════════════════════════════════════════════════════════════ */

const Brand = () => (
  <div className="brand">
    <span className="logo-plate"><img src={logo} alt="המכללה הלאומית לאיתנות ישראלית" /></span>
    <div><strong>מצפן החלטות</strong><small>מדיניות התגוננות לאוכלוסייה</small></div>
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

function Shell({ steps, step, right, mid, left, bar, midTop = true }) {
  return (
    <div className="w-root">
      <Col top={<Brand />}>{right}</Col>
      <Col top={midTop ? <Steps steps={steps} step={step} /> : null} bar={bar}>{mid}</Col>
      <Col>{left}</Col>
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
    <Shell {...sh} midTop={false}
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
            <li><b>4</b>מקבלים המלצה לכל מגזר</li>
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
        <Head eyebrow="תמונת מצב · 1 מתוך 3" title="מאיפה אנחנו מתחילים?" sub="לפני שבוחנים שינוי במדיניות – מגדירים את נקודת המוצא." />
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
            {LEVELS.map((l) => (
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

/* סיכום תמונת המצב (מסך שמאלי בשלבי תמונת המצב 2 ו-3) */
function Summary({ ctx, threat }) {
  const prev = LEVELS[ctx.prevLevel - 1]
  const esc = ESCALATION.find((e) => e.n === ctx.escalation)
  const trend = TRENDS.find((t) => t.id === ctx.trend)
  return (
    <div className="panel w-fill w-summary">
      <h3>סיכום תמונת המצב</h3>
      <div className="srow"><span>יום במערכה</span><b>{ctx.day}</b></div>
      <div className="srow"><span>מול מי</span><b>{ctx.adversaries.length ? ctx.adversaries.join(', ') : '—'}</b></div>
      {prev && <div className="srow"><span>מדיניות קודמת</span><b className="lv-pill" style={{ '--lvl': prev.color }}>{prev.name}</b></div>}
      {ctx.current && (
        <>
          <h4>המצב בפועל היום</h4>
          {SECTORS.map((s) => {
            const l = LEVELS[(ctx.current[s.id] || 1) - 1]
            return (
              <div className="srow" key={s.id}>
                <span>{s.icon} {s.name}</span>
                <b className="lv-pill" style={{ '--lvl': l.color }}>{l.name}</b>
              </div>
            )
          })}
        </>
      )}
      {threat && (
        <>
          <h4>התפתחות האיום</h4>
          <div className="srow"><span>סבירות להגברה</span><b>{esc ? `${esc.icon} ${esc.label}` : '—'}</b></div>
          <div className="srow"><span>מגמה</span><b>{trend ? `${trend.icon} ${trend.label}` : '—'}</b></div>
        </>
      )}
    </div>
  )
}

/* ───────── תמונת מצב 2: המצב בפועל ───────── */
function StateW({ sh, ctx, setCtx, onBack, onNext }) {
  const setSector = (id, lvl) => setCtx({ ...ctx, current: { ...ctx.current, [id]: lvl }, currentTouched: true })
  const sectorPanel = (id) => {
    const s = SECTORS.find((x) => x.id === id)
    return (
      <div className="panel w-fill" key={id}>
        <h3><span className="sector-icon">{s.icon}</span> {s.name}</h3>
        <div className="opts">
          {LEVELS.map((l) => (
            <button key={l.id} className={`opt ${ctx.current[s.id] === l.id ? 'on' : ''}`}
              style={{ '--lvl': l.color }} aria-pressed={ctx.current[s.id] === l.id}
              onClick={() => setSector(s.id, l.id)}>
              <b>{l.id}</b>
              <span>{s.actions[l.id - 1]}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }
  return (
    <Shell {...sh}
      right={<>
        <Head eyebrow="תמונת מצב · 2 מתוך 3" title="מה המצב בפועל היום?" sub="מולא מראש לפי המדיניות הקודמת – תקנו בכל מגזר לפי המציאות." />
        {sectorPanel('essential')}
        {sectorPanel('work')}
      </>}
      mid={<><Head ghost />{sectorPanel('gather')}{sectorPanel('edu')}</>}
      left={<><Head ghost /><Summary ctx={ctx} /></>}
      bar={<Nav onBack={onBack} onNext={onNext} nextLabel="המשך" />}
    />
  )
}

/* ───────── תמונת מצב 3: האיום ───────── */
function ThreatW({ sh, ctx, setCtx, onBack, onNext }) {
  const ready = ctx.escalation && ctx.trend
  return (
    <Shell {...sh}
      right={<>
        <Head eyebrow="תמונת מצב · 3 מתוך 3" title="לאן האיום מתפתח?" sub="הערכה שלכם לגבי הימים הקרובים." />
        <div className="panel w-fill">
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
      </>}
      mid={<>
        <Head ghost />
        <div className="panel w-fill">
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
      </>}
      left={<><Head ghost /><Summary ctx={ctx} threat /></>}
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
function RateW({ sh, selected, ratings, setRatings, onBack, onNext }) {
  const done = selected.filter((id) => ratings[id]).length
  const ready = done === selected.length
  const [r, m, l] = groupsPerScreen().map((groups) =>
    groups.length === 0 ? <Head ghost /> : groups.map((g) => {
      const list = FACTORS.filter((f) => f.group === g.id && selected.includes(f.id))
      return (
        <Fragment key={g.id}>
          <div className="w-head">
            <h2><span>{g.icon}</span> {g.name}</h2>
            <p>לחצו על המדחום: 1 – שולי, 5 – קריטי ביותר.</p>
          </div>
          {list.length === 0 ? (
            <div className="w-empty">לא נבחרו נתונים בקטגוריה זו</div>
          ) : (
            <div className="w-rate">
              {list.map((f) => {
                const v = ratings[f.id] || 0
                return (
                  <article key={f.id} className={`w-rate-card ${f.lean > 0 ? 'protect' : 'routine'} ${v ? 'rated' : ''}`}>
                    <span className="rate-icon">{f.icon}</span>
                    <div className="rt">
                      <strong>{f.label}</strong>
                      <span className="rt-read">{v ? `${v} · ${RATING_LABEL[v]}` : 'טרם דורג'}</span>
                    </div>
                    <Thermometer value={v} name={f.label} onChange={(n) => setRatings({ ...ratings, [f.id]: n })} />
                  </article>
                )
              })}
            </div>
          )}
        </Fragment>
      )
    })
  )
  return (
    <Shell {...sh} right={r} mid={m} left={l}
      bar={<Nav onBack={onBack} onNext={onNext} disabled={!ready}
        nextLabel={ready ? 'עיבוד נתונים' : 'דרגו את כל הנתונים'}
        center={<>
          <div className="progress"><i style={{ width: `${selected.length ? (100 * done) / selected.length : 0}%` }} /></div>
          דורגו <b>{done}</b> מתוך <b>{selected.length}</b></>} />}
    />
  )
}

/* ───────── עיבוד ───────── */
function ProcessingW({ sh, items }) {
  return <Shell {...sh} right={null} mid={<Processing items={items} />} left={null} />
}

/* ───────── המלצה ───────── */
function ResultsW({ sh, result, items, ctx, onEdit, onRestart }) {
  const [score, setScore] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setScore(result.score), 500)
    return () => clearTimeout(t)
  }, [result.score])
  const lvl = levelInfo(result.score)
  const sentence = String(result.paragraph).split(/\n+/).map((x) => x.trim()).filter(Boolean).join(' ')
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
            <p className="ai-line"><b>המלצת AI:</b> {sentence}</p>
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
  const { screen, setScreen, ctx, setCtx, selected, setSelected, ratings, setRatings, items, result, run, restart, goState, steps, step } = p
  const sh = { steps, step }
  switch (screen) {
    case 'welcome':
      return <WelcomeW sh={sh} onStart={() => setScreen('context')} />
    case 'context':
      return <ContextW sh={sh} ctx={ctx} setCtx={setCtx} onBack={restart} onNext={goState} />
    case 'state':
      return ctx.current ? <StateW sh={sh} ctx={ctx} setCtx={setCtx} onBack={() => setScreen('context')} onNext={() => setScreen('threat')} /> : null
    case 'threat':
      return <ThreatW sh={sh} ctx={ctx} setCtx={setCtx} onBack={() => setScreen('state')} onNext={() => setScreen('select')} />
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