import { useEffect, useState } from 'react'
import Gauge from '../components/Gauge'

export default function Welcome({ onStart }) {
  const [score, setScore] = useState(50)
  useEffect(() => {
    const id = setInterval(() => setScore(10 + Math.random() * 80), 2400)
    return () => clearInterval(id)
  }, [])
  return (
    <section className="screen welcome">
      <div className="welcome-gauge"><Gauge score={score} /></div>
      <h1>איפה נקודת האיזון בין הצלת חיים לשגרה?</h1>
      <p className="lead">בחרו את הנתונים החשובים לכם, דרגו עד כמה כל אחד קריטי להחלטה, ותקבלו המלצה חזותית.</p>
      <button className="btn-xl" onClick={onStart}>התחילו בבחירת נתונים</button>
    </section>
  )
}
