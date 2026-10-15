// מדחום קריטיות 1–5 (ירוק למטה → אדום למעלה). כל מקטע הוא כפתור מגע גדול.
const SEGMENTS = [
  { n: 5, color: '#D62839', label: 'קריטי' },
  { n: 4, color: '#E2692A', label: 'גבוה' },
  { n: 3, color: '#EBA52B', label: 'בינוני' },
  { n: 2, color: '#F2D030', label: 'נמוך' },
  { n: 1, color: '#2FA84F', label: 'שולי' },
]

export const RATING_LABEL = Object.fromEntries(SEGMENTS.map((s) => [s.n, s.label]))

export default function Thermometer({ value = 0, onChange, name }) {
  return (
    <div className="thermo" role="radiogroup" aria-label={`קריטיות: ${name}`}>
      {SEGMENTS.map(({ n, color, label }) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} – ${label}`}
          className={`seg ${value >= n ? 'on' : ''} ${value === n ? 'top' : ''} ${n === 5 ? 'cap' : ''} ${n === 1 ? 'bulb' : ''}`}
          style={{ '--c': color }}
          onClick={() => onChange(n)}
        >
          {n}
        </button>
      ))}
    </div>
  )
}
