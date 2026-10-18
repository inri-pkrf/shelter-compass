import { ESCALATION, TRENDS } from '../data/context'
// מנוע החישוב המקומי. משמש כחישוב בסיס לבינה המלאכותית, וגם כגיבוי כשאין חיבור ל-AI.

export const LEVELS = [
  { id: 1, name: 'פעילות מלאה', headline: 'אפשר לחזור לשגרה', color: '#2FA84F', explain: 'חזרה מלאה לשגרה, ללא הגבלות מיוחדות', desc: 'שגרה מלאה, ללא הגבלות' },
  { id: 2, name: 'פעילות חלקית', headline: 'חזרה מדורגת לשגרה', color: '#E6C229', explain: 'חזרה לשגרה בהגבלות, תוך שמירה על קרבה למרחב מוגן', desc: 'הגבלות חלקיות, קרבה למרחב מוגן' },
  { id: 3, name: 'פעילות מצומצמת', headline: 'שגרה מצומצמת בלבד', color: '#EE8A2B', explain: 'פעילות מצומצמת במקומות שאפשר להגיע מהם למרחב מוגן תקני', desc: 'התקהלויות עד 50, חינוך סגור, עבודה ליד מרחב מוגן' },
  { id: 4, name: 'פעילות הכרחית בלבד', headline: 'להישאר בבית ובמרחב מוגן', color: '#D62839', explain: 'פעילות הכרחית בלבד – כל השאר נשארים בבית', desc: 'משק חיוני בלבד, חינוך סגור, השאר בבית' },
]

export const SECTORS = [
  { id: 'essential', name: 'עובדי משק חיוני', icon: '👷', bias: -8,
    actions: ['חזרה מלאה לעבודה', 'עבודה בהגבלות קלות', 'כוח אדם מינימלי, סמוך למרחב מוגן', 'רק פעילות חיונית בתוך מרחב מוגן'] },
  { id: 'work', name: 'מקומות עבודה', icon: '🏢', bias: 0,
    actions: ['פתיחה מלאה', 'עבודה חלקית וקבלת קהל מוגבלת', 'רק מקומות עם מרחב מוגן בהישג', 'משק חיוני בלבד, השאר מהבית'] },
  { id: 'gather', name: 'התקהלויות ושירותים', icon: '🎭', bias: 6,
    actions: ['ללא הגבלה', 'התקהלויות מוגבלות', 'עד 50 איש ליד מרחב מוגן', 'ללא התקהלויות, חופים סגורים'] },
  { id: 'edu', name: 'פעילות חינוכית', icon: '🎓', bias: 10,
    actions: ['לימודים רגילים', 'לימודים בהגבלות', 'מסגרות לילדי עובדים חיוניים בלבד', 'אין פעילות חינוכית'] },
]

const clamp = (n) => Math.max(0, Math.min(100, n))
const weight = (rating) => rating * rating // דירוג גבוה משפיע הרבה יותר

export const levelOf = (score) => (score < 25 ? 1 : score < 50 ? 2 : score < 75 ? 3 : 4)
export const levelInfo = (score) => LEVELS[levelOf(score) - 1]

export const joinHe = (arr) =>
  arr.length <= 1 ? arr.join('') : arr.slice(0, -1).join(', ') + ' ו' + arr[arr.length - 1]

/** items: [{ factor, rating }] */
export const ctxShift = (ctx) =>
  ((ctx?.escalation ?? 3) - 3) * 4 + (TRENDS.find((t) => t.id === ctx?.trend)?.shift ?? 0)

export function computeBaseline(items, ctx) {
  const shift = ctxShift(ctx)
  let num = 0, den = 0, routineW = 0
  items.forEach(({ factor, rating }) => {
    const w = weight(rating)
    num += w * factor.lean
    den += w
    if (factor.lean < 0) routineW += w
  })
  const overall = den ? clamp(50 + (50 * num) / den + shift) : clamp(50 + shift)

  const sectors = {}
  SECTORS.forEach((sec, i) => {
    let n = 0, d = 0
    items.forEach(({ factor, rating }) => {
      const w = weight(rating) * factor.s[i]
      n += w * factor.lean
      d += w
    })
    const specific = d ? clamp(50 + (50 * n) / d + shift) : overall
    sectors[sec.id] = Math.round(clamp(0.5 * overall + 0.5 * specific + sec.bias))
  })

  return {
    score: Math.round(overall),
    sectors,
    shift,
    routineShare: den ? Math.round((100 * routineW) / den) : 50,
  }
}

/** תוצאה מקומית (ללא AI) – כולל פסקת עיבוד נתונים בעברית */
export function describeContext(ctx) {
  if (!ctx) return null
  const lv = (n) => LEVELS[n - 1]?.name
  return {
    dayOfWar: ctx.day,
    adversaries: ctx.adversaries,
    previousPolicyLevel: lv(ctx.prevLevel),
    currentRestrictionsBySector: Object.fromEntries(
      SECTORS.map((sec) => [sec.id, `${lv(ctx.current?.[sec.id])}: ${sec.actions[(ctx.current?.[sec.id] || 1) - 1]}`])
    ),
    escalationLikelihood: ESCALATION.find((e) => e.n === ctx.escalation)?.label,
    threatTrend: TRENDS.find((t) => t.id === ctx.trend)?.label,
  }
}

export function localResult(items, baseline, ctx) {
  const lvl = levelInfo(baseline.score)
  const diff = ctx?.prevLevel ? lvl.id - ctx.prevLevel : 0
  const move = !ctx?.prevLevel ? '' : diff < 0 ? 'הקלה לעומת המדיניות הקודמת' : diff > 0 ? 'החמרה לעומת המדיניות הקודמת' : 'המשך המדיניות הקודמת'
  const lines = [`לאחר עיבוד נתונים מעמיק, המלצת ה-AI להתגוננות היא ${lvl.name}${move ? ' – ' + move : ''}.`]
  return {
    score: baseline.score,
    sectors: baseline.sectors,
    headline: lvl.headline,
    paragraph: lines.join('\n'),
    source: 'local',
  }
}