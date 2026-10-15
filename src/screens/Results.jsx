import { useEffect, useState } from 'react'
import Gauge from '../components/Gauge'
import { LEVELS, SECTORS, levelOf, levelInfo } from '../lib/engine'

export default function Results({ result, items, onEdit, onRestart }) {
  const [score, setScore] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setScore(result.score), 500)
    return () => clearTimeout(t)
  }, [result.score])

  const lvl = levelInfo(result.score)
  const top = [...items].sort((a, b) => b.rating - a.rating).slice(0, 6)

  return (
    <section className="screen results">
      <div className="scroll">
        <div className="verdict" style={{ '--lvl': lvl.color }}>
          <Gauge score={score} activeLevel={lvl.id} />
          <div className="verdict-plate">
            <small>ההמלצה</small>
            <h2>{result.headline || lvl.headline}</h2>
            <span className="level-name">{lvl.name}</span>
          </div>
        </div>

        <div className="sectors">
          {SECTORS.map((s) => {
            const sc = result.sectors[s.id]
            const l = levelOf(sc)
            return (
              <div className="sector" key={s.id} style={{ '--lvl': LEVELS[l - 1].color }}>
                <div className="sector-top">
                  <span className="sector-icon">{s.icon}</span>
                  <strong>{s.name}</strong>
                  <b className="sector-level">{LEVELS[l - 1].name}</b>
                </div>
                <div className="track"><i style={{ left: `${sc}%` }} /></div>
                <p>{s.actions[l - 1]}</p>
              </div>
            )
          })}
        </div>

        <div className="analysis">
          <div className="analysis-head">
            <h3>עיבוד נתונים</h3>
            <span className={`src ${result.source}`}>{result.source === 'ai' ? '✦ נוצר על ידי בינה מלאכותית' : 'חישוב מקומי (ללא AI)'}</span>
          </div>
          <div className="chips">
            {top.map(({ factor, rating }) => (
              <span key={factor.id} className={`chip big ${factor.lean > 0 ? 'red' : 'green'}`}>
                {factor.icon} {factor.label} · {rating}
              </span>
            ))}
          </div>
          <p className="analysis-text">{result.paragraph}</p>
          <p className="disclaimer">כלי עזר חזותי לתמיכה בשיקול דעת – אינו מחליף הנחיה מבצעית.</p>
        </div>
      </div>

      <footer className="bar">
        <button className="btn-ghost" onClick={onEdit}>שינוי הדירוג</button>
        <span />
        <button className="btn-xl sm" onClick={onRestart}>התחלה מחדש</button>
      </footer>
    </section>
  )
}
