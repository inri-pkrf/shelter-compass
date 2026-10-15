import { useState } from 'react'
import { FACTORS, GROUPS } from '../data/factors'

export default function SelectFactors({ selected, setSelected, onNext, onBack }) {
  const [tab, setTab] = useState(GROUPS[0].id)
  const toggle = (id) =>
    setSelected(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])
  const count = (g) => FACTORS.filter((f) => f.group === g && selected.includes(f.id)).length

  return (
    <section className="screen select">
      <div className="screen-head">
        <h2>אילו נתונים חשוב לקחת בחשבון?</h2>
        <p>סמנו את כל הנתונים שחשובים לכם בהחלטה. אפשר לעבור בין הקטגוריות.</p>
      </div>

      <div className="tabs" role="tablist">
        {GROUPS.map((g) => (
          <button key={g.id} role="tab" aria-selected={tab === g.id}
            className={`tab ${tab === g.id ? 'active' : ''}`} onClick={() => setTab(g.id)}>
            <span className="tab-icon">{g.icon}</span>
            <span>{g.name}</span>
            {count(g.id) > 0 && <b className="badge">{count(g.id)}</b>}
          </button>
        ))}
      </div>

      <div className="grid scroll">
        {FACTORS.filter((f) => f.group === tab).map((f) => {
          const on = selected.includes(f.id)
          return (
            <button key={f.id} className={`pick ${on ? 'on' : ''} ${f.lean > 0 ? 'protect' : 'routine'}`}
              aria-pressed={on} onClick={() => toggle(f.id)}>
              <span className="pick-icon">{f.icon}</span>
              <span className="pick-text">
                <strong>{f.label}</strong>
                <small>{f.desc}</small>
              </span>
              <span className="check">{on ? '✓' : ''}</span>
            </button>
          )
        })}
      </div>

      <footer className="bar">
        <button className="btn-ghost" onClick={onBack}>חזרה</button>
        <div className="bar-count">
          <b>{selected.length}</b> נתונים נבחרו
          {selected.length > 0 && <button className="link" onClick={() => setSelected([])}>נקה הכל</button>}
        </div>
        <button className="btn-xl sm" disabled={selected.length < 2} onClick={onNext}>
          {selected.length < 2 ? 'בחרו לפחות 2 נתונים' : 'המשך לדירוג'}
        </button>
      </footer>
    </section>
  )
}
