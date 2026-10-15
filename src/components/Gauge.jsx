import { LEVELS } from '../lib/engine'

const CX = 400, CY = 400, R = 350, r = 230

// t = 0 → שמאל, 90 → למעלה, 180 → ימין
const pt = (rad, t) => {
  const a = (t * Math.PI) / 180
  return [CX - rad * Math.cos(a), CY - rad * Math.sin(a)]
}
const arc = (t1, t2) => {
  const [x1, y1] = pt(R, t1), [x2, y2] = pt(R, t2)
  const [x3, y3] = pt(r, t2), [x4, y4] = pt(r, t1)
  return `M${x1} ${y1} A${R} ${R} 0 0 1 ${x2} ${y2} L${x3} ${y3} A${r} ${r} 0 0 0 ${x4} ${y4}Z`
}

/** מד חצי-עיגול: ירוק (שגרה) משמאל → אדום (התגוננות) מימין */
export default function Gauge({ score, activeLevel }) {
  const deg = -90 + (Math.max(0, Math.min(100, score ?? 0)) * 180) / 100
  return (
    <svg className="gauge" viewBox="0 0 800 470" role="img" aria-label="מד המלצה">
      <path d={arc(0, 180)} fill="rgba(255,255,255,.08)" transform="translate(0,0) scale(1.0)" />
      {LEVELS.map((lv, i) => (
        <path
          key={lv.id}
          d={arc(i * 45 + 1.5, (i + 1) * 45 - 1.5)}
          fill={lv.color}
          opacity={activeLevel == null || activeLevel === lv.id ? 1 : 0.35}
          style={{ transition: 'opacity .6s' }}
        />
      ))}
      <text x="70" y="448" className="gauge-end" textAnchor="middle">שגרה</text>
      <text x="730" y="448" className="gauge-end" textAnchor="middle">התגוננות</text>

      <g className="needle" style={{ transform: `rotate(${deg}deg)`, transformOrigin: `${CX}px ${CY}px` }}>
        <polygon points="388,408 412,408 403,92 397,92" fill="#F3F5FA" />
        <circle cx={CX} cy={92} r="9" fill="#F3F5FA" />
      </g>
      <circle cx={CX} cy={CY} r="46" fill="#F3F5FA" />
      <circle cx={CX} cy={CY} r="20" fill="#0B1F4B" />
    </svg>
  )
}
