import Thermometer, { RATING_LABEL } from '../components/Thermometer'
import { FACTOR_BY_ID } from '../data/factors'

export default function RateFactors({ selected, ratings, setRatings, onNext, onBack }) {
  const done = selected.filter((id) => ratings[id]).length
  const ready = done === selected.length
  return (
    <section className="screen rate">
      <div className="screen-head">
        <h2>עד כמה כל נתון קריטי להחלטה?</h2>
        <p>לחצו על המדחום: 1 – שולי, 5 – קריטי ביותר.</p>
      </div>

      <div className="grid scroll">
        {selected.map((id) => {
          const f = FACTOR_BY_ID[id]
          const v = ratings[id] || 0
          return (
            <article key={id} className={`rate-card ${f.lean > 0 ? 'protect' : 'routine'} ${v ? 'rated' : ''}`}>
              <Thermometer value={v} name={f.label} onChange={(n) => setRatings({ ...ratings, [id]: n })} />
              <div className="rate-text">
                <span className="rate-icon">{f.icon}</span>
                <strong>{f.label}</strong>
                <small>{f.desc}</small>
                <span className={`chip ${f.lean > 0 ? 'red' : 'green'}`}>
                  {f.lean > 0 ? 'מושך להתגוננות' : 'מושך לשגרה'}
                </span>
                <span className="rate-readout">{v ? `${v} · ${RATING_LABEL[v]}` : 'טרם דורג'}</span>
              </div>
            </article>
          )
        })}
      </div>

      <footer className="bar">
        <button className="btn-ghost" onClick={onBack}>חזרה</button>
        <div className="bar-count">
          <div className="progress"><i style={{ width: `${(100 * done) / selected.length}%` }} /></div>
          דורגו <b>{done}</b> מתוך <b>{selected.length}</b>
        </div>
        <button className="btn-xl sm" disabled={!ready} onClick={onNext}>
          {ready ? 'עיבוד נתונים' : 'דרגו את כל הנתונים'}
        </button>
      </footer>
    </section>
  )
}
