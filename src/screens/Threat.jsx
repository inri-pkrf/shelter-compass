import { ESCALATION, TRENDS } from '../data/context'

export default function Threat({ ctx, setCtx, onNext, onBack }) {
  const ready = ctx.escalation && ctx.trend
  return (
    <section className="screen ctx">
      <div className="screen-head">
        <small className="eyebrow">תמונת מצב · 2 מתוך 2</small>
        <h2>לאן האיום מתפתח?</h2>
        <p>הערכה שלכם לגבי הימים הקרובים.</p>
      </div>

      <div className="scroll ctx-body">
        <div className="panel">
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

        <div className="panel">
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
      </div>

      <footer className="bar">
        <button className="btn-ghost" onClick={onBack}>חזרה</button>
        <span />
        <button className="btn-xl sm" disabled={!ready} onClick={onNext}>
          {ready ? 'לבחירת הנתונים' : 'השלימו את שני הנתונים'}
        </button>
      </footer>
    </section>
  )
}