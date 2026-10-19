import { useEffect, useState } from 'react'

const MESSAGES = ['קורא את הנתונים שבחרתם…', 'שוקל את רמת הקריטיות של כל נתון…', 'מאזן בין הצלת חיים לשגרה…', 'בונה המלצה למדיניות התגוננות…']

export default function Processing({ items }) {
  const [m, setM] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setM((x) => (x + 1) % MESSAGES.length), 1100)
    return () => clearInterval(id)
  }, [])
  return (
    <section className="screen processing">
      <div className="orbit">
        {items.map(({ factor, rating }, i) => {
          const a = i * 137.5 * (Math.PI / 180)
          const rad = 420 + (i % 3) * 60
          return (
            <span key={factor.id}
              className={`flyer ${factor.lean > 0 ? 'red' : 'green'}`}
              style={{ '--x': `${Math.cos(a) * rad}px`, '--y': `${Math.sin(a) * rad}px`, '--d': `${(i % 12) * 0.22}s` }}>
              {factor.icon} {factor.label}
            </span>
          )
        })}
        <div className="core"><span>AI</span></div>
      </div>
      <h2 className="proc-msg" key={m}>{MESSAGES[m]}</h2>
    </section>
  )
}
