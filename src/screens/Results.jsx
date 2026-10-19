import { useEffect, useState } from 'react'
import Gauge from '../components/Gauge'
import { LEVELS, SECTORS, levelOf, levelInfo } from '../lib/engine'

export default function Results({ result, items, ctx, onEdit, onRestart }) {
  const [score, setScore] = useState(0)
  useEffect(() => {
    // המחוג בדיוק באמצע הצבע של הרמה שהומלצה (12.5 / 37.5 / 62.5 / 87.5)
    const t = setTimeout(() => setScore((levelOf(result.score) - 1) * 25 + 12.5), 500)
    return () => clearTimeout(t)
  }, [result.score])

  const lvl = levelInfo(result.score)
  const sentence = String(result.paragraph).split(/\n+/).map((x) => x.trim()).filter(Boolean).join(' ')

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
          <span className="j-arrow">{lvl.id < ctx.prevLevel ? '⬅️ הקלה' : lvl.id > ctx.prevLevel ? '⬅️ החמרה' : '⬅️ ללא שינוי'}</span>
          <div className="j-chip" style={{ '--lvl': lvl.color }}>
            <small>המלצה</small><strong>{lvl.name}</strong>
          </div>
          <div className="j-meta">יום {ctx.day} למערכה{ctx.adversaries.length ? ` · ${ctx.adversaries.join(', ')}` : ''}</div>
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
                {(() => {
                  const c = ctx.current?.[s.id]
                  const d = l - c
                  return (
                    <span className={`delta ${d < 0 ? 'ease' : d > 0 ? 'tight' : 'same'}`}>
                      {d < 0 ? '⬇ הקלה' : d > 0 ? '⬆ החמרה' : '＝ ללא שינוי'} · היום: {LEVELS[c - 1].name}
                    </span>
                  )
                })()}
              </div>
            )
          })}
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