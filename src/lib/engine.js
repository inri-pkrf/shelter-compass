// מנוע החישוב המקומי. משמש כחישוב בסיס לבינה המלאכותית, וגם כגיבוי כשאין חיבור ל-AI.

export const LEVELS = [
  { id: 1, name: 'פעילות מלאה', headline: 'אפשר לחזור לשגרה', color: '#2FA84F', explain: 'חזרה מלאה לשגרה, ללא הגבלות מיוחדות' },
  { id: 2, name: 'פעילות חלקית', headline: 'חזרה מדורגת לשגרה', color: '#E6C229', explain: 'חזרה לשגרה בהגבלות, תוך שמירה על קרבה למרחב מוגן' },
  { id: 3, name: 'פעילות מצומצמת', headline: 'שגרה מצומצמת בלבד', color: '#EE8A2B', explain: 'פעילות מצומצמת במקומות שאפשר להגיע מהם למרחב מוגן תקני' },
  { id: 4, name: 'פעילות הכרחית בלבד', headline: 'להישאר בבית ובמרחב מוגן', color: '#D62839', explain: 'פעילות הכרחית בלבד – כל השאר נשארים בבית' },
]

export const SECTORS = [
  { id: 'essential', name: 'עובדי משק חיוני', icon: '👷', bias: -8,
    actions: ['חזרה מלאה לעבודה', 'עבודה בהגבלות קלות', 'כוח אדם מינימלי, סמוך למרחב מוגן', 'רק פעילות חיונית בתוך מרחב מוגן'] },
  { id: 'work', name: 'מקומות עבודה', icon: '🏢', bias: 0,
    actions: ['פתיחה מלאה', 'עבודה חלקית וקבלת קהל מוגבלת', 'רק מקומות עם מרחב מוגן בהישג', 'עבודה מהבית'] },
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
export function computeBaseline(items) {
  let num = 0, den = 0, routineW = 0
  items.forEach(({ factor, rating }) => {
    const w = weight(rating)
    num += w * factor.lean
    den += w
    if (factor.lean < 0) routineW += w
  })
  const overall = den ? clamp(50 + (50 * num) / den) : 50

  const sectors = {}
  SECTORS.forEach((sec, i) => {
    let n = 0, d = 0
    items.forEach(({ factor, rating }) => {
      const w = weight(rating) * factor.s[i]
      n += w * factor.lean
      d += w
    })
    const specific = d ? 50 + (50 * n) / d : overall
    sectors[sec.id] = Math.round(clamp(0.5 * overall + 0.5 * specific + sec.bias))
  })

  return {
    score: Math.round(overall),
    sectors,
    routineShare: den ? Math.round((100 * routineW) / den) : 50,
  }
}

/** תוצאה מקומית (ללא AI) – כולל פסקת עיבוד נתונים בעברית */
export function localResult(items, baseline) {
  const lvl = levelInfo(baseline.score)
  const byRating = (arr) => [...arr].sort((a, b) => b.rating - a.rating).slice(0, 3)
  const top = (sign) =>
    byRating(items.filter((i) => (sign > 0 ? i.factor.lean > 0 : i.factor.lean < 0)))
      .filter((i) => i.rating >= 3)
      .map((i) => `“${i.factor.label}”`)

  const protect = top(1)
  const routine = top(-1)
  const parts = [`לאור כך שבחרת ${items.length} נתונים לשיקול, הבנתי כך:`]
  if (routine.length) parts.push(`שיקולי השגרה והמשק שהודגשו הם ${joinHe(routine)}.`)
  if (protect.length) parts.push(`שיקולי הביטחון וההתגוננות שהודגשו הם ${joinHe(protect)}.`)
  parts.push(
    `במשקל המצטבר, ${baseline.routineShare}% מהחשיבות שנתת נוטה לשגרה ו-${100 - baseline.routineShare}% להתגוננות.`
  )
  const s = baseline.sectors
  parts.push(
    `ההמלצה הכוללת: ${lvl.explain} (${lvl.name}). ` +
      `עובדי משק חיוני – ${LEVELS[levelOf(s.essential) - 1].name}; ` +
      `פעילות חינוכית – ${LEVELS[levelOf(s.edu) - 1].name}.`
  )
  return {
    score: baseline.score,
    sectors: baseline.sectors,
    headline: lvl.headline,
    paragraph: parts.join(' '),
    source: 'local',
  }
}
