import { ADVERSARIES } from '../data/context'
import { LEVELS } from '../lib/engine'

export default function Context({ ctx, setCtx, onNext, onBack }) {
  const set = (patch) => setCtx({ ...ctx, ...patch })
  const toggleAdv = (a) =>
    set({ adversaries: ctx.adversaries.includes(a) ? ctx.adversaries.filter((x) => x !== a) : [...ctx.adversaries, a] })
  return (
    <section className="screen ctx">
      <div className="screen-head">
        <small className="eyebrow">תמונת מצב · 1 מתוך 2</small>
        <h2>מאיפה אנחנו מתחילים?</h2>
        <p>לפני שבוחנים שינוי במדיניות – מגדירים את נקודת המוצא.</p>
      </div>

      <div className="scroll ctx-body">
        <div className="panel">
          <h3>כמה זמן אנחנו במערכה?</h3>
          <div className="stepper">
            <button className="round" aria-label="פחות" onClick={() => set({ day: Math.max(1, ctx.day - 1) })}>−</button>
            <div className="day"><small>היום ה-</small><b>{ctx.day}</b><small>למערכה</small></div>
            <button className="round" aria-label="יותר" onClick={() => set({ day: Math.min(99, ctx.day + 1) })}>+</button>
          </div>
        </div>

        <div className="panel">
          <h3>מול מי? <small>(אפשר לבחור כמה)</small></h3>
          <div className="chips-row">
            {ADVERSARIES.map((a) => (
              <button key={a} className={`pill ${ctx.adversaries.includes(a) ? 'on' : ''}`}
                aria-pressed={ctx.adversaries.includes(a)} onClick={() => toggleAdv(a)}>{a}</button>
            ))}
          </div>
        </div>

        <div className="panel">
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
      </div>

      <footer className="bar">
        <button className="btn-ghost" onClick={onBack}>חזרה</button>
        <span />
        <button className="btn-xl sm" disabled={!ctx.prevLevel} onClick={onNext}>
          {ctx.prevLevel ? 'המשך' : 'בחרו מדיניות קודמת'}
        </button>
      </footer>
    </section>
  )
}