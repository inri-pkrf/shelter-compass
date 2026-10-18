import { LEVELS, SECTORS } from '../lib/engine'

export default function CurrentState({ ctx, setCtx, onNext, onBack }) {
  const setSector = (id, lvl) => setCtx({ ...ctx, current: { ...ctx.current, [id]: lvl }, currentTouched: true })
  return (
    <section className="screen ctx">
      <div className="screen-head">
        <small className="eyebrow">תמונת מצב · 2 מתוך 3</small>
        <h2>מה המצב בפועל היום?</h2>
        <p>מולא מראש לפי המדיניות הקודמת – תקנו בכל מגזר לפי המציאות.</p>
      </div>

      <div className="scroll ctx-body">
        {SECTORS.map((s) => (
          <div className="panel" key={s.id}>
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
        ))}
      </div>

      <footer className="bar">
        <button className="btn-ghost" onClick={onBack}>חזרה</button>
        <span />
        <button className="btn-xl sm" onClick={onNext}>המשך</button>
      </footer>
    </section>
  )
}
