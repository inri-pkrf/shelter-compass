// server/index.cjs
// פרוקסי קטן ל-Claude: המפתח נשאר בשרת ולא נחשף ללקוח.
// מקבל POST /api/analyze ומחזיר { score, sectors, headline, paragraph, tighten }.

require('dotenv').config()
const express = require('express')

const PORT = process.env.PORT || 8787
const API_KEY = process.env.ANTHROPIC_API_KEY
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5'

const SECTOR_IDS = ['essential', 'work', 'gather', 'edu']
const SECTOR_NAMES = {
  essential: 'עובדי משק חיוני',
  work: 'מקומות עבודה',
  gather: 'התקהלויות ושירותים',
  edu: 'פעילות חינוכית',
}

const app = express()
app.use(express.json({ limit: '200kb' }))

// CORS פשוט – נחוץ רק כשהלקוח מאוחסן בדומיין אחר (למשל GitHub Pages)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

app.get('/api/health', (_req, res) => res.json({ ok: true, ai: Boolean(API_KEY), model: MODEL }))

const clamp = (n) => Math.max(0, Math.min(100, Math.round(Number(n))))
const isNum = (n) => typeof n === 'number' && Number.isFinite(n)

const SYSTEM_PROMPT = `אתה יועץ מקצועי התומך בקבלת החלטות בנושא מדיניות התגוננות לאוכלוסייה בישראל.
תקבל: (1) רשימת שיקולים שנבחרו ודירוג קריטיות שלהם (1–5), (2) חישוב בסיס ראשוני, (3) תמונת מצב (יום במערכה, זירות, מדיניות קודמת, מגבלות בפועל בכל מגזר, סבירות הגברת האיום ומגמתו).

סולם הציון 0–100:
0–24 פעילות מלאה, 25–49 פעילות חלקית, 50–74 פעילות מצומצמת, 75–100 פעילות הכרחית בלבד.
ציון גבוה = נטייה להתגוננות. ציון נמוך = נטייה לשגרה.

הנחיות:
- חישוב הבסיס הוא נקודת התחלה. אפשר לסטות ממנו במידה סבירה (עד כ-15 נקודות) רק אם יש לכך הצדקה ברורה מהנתונים.
- תן ציון כללי וציון לכל אחד מארבעת המגזרים: essential, work, gather, edu.
- headline: משפט קצר מאוד (עד 6 מילים) שמסכם את ההמלצה.
- paragraph: פסקה קצרה בעברית (3–5 משפטים) המסבירה את ההמלצה, מזכירה את השיקולים המרכזיים ואת היחס למדיניות הקודמת. בלי המצאת עובדות שלא נמסרו.
- tighten: משפט אחד: באיזה תחום מומלץ להחמיר לעומת המצב כיום, או "לא מומלץ להחמיר באף תחום."
- זו המלצה תומכת החלטה בלבד, וההחלטה נשארת בידי מקבלי ההחלטות.

החזר JSON בלבד, בלי טקסט נוסף ובלי גדרות קוד, במבנה:
{"score":number,"sectors":{"essential":number,"work":number,"gather":number,"edu":number},"headline":string,"paragraph":string,"tighten":string}`

function buildUserMessage({ selections, baseline, context }) {
  const rows = selections
    .map(
      (s) =>
        `- ${s.label} [קבוצה: ${s.group}] דירוג קריטיות: ${s.rating}/5, כיוון: ${s.lean > 0 ? 'מחמיר' : 'מקל'} (${s.lean})`
    )
    .join('\n')

  return `תמונת מצב:
${JSON.stringify(context, null, 2)}

שיקולים שנבחרו:
${rows}

חישוב בסיס:
${JSON.stringify(baseline, null, 2)}

שמות המגזרים: ${SECTOR_IDS.map((id) => `${id}=${SECTOR_NAMES[id]}`).join(', ')}`
}

function extractJson(text) {
  const clean = String(text).replace(/```json|```/g, '').trim()
  const start = clean.indexOf('{')
  const end = clean.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('no JSON in model output')
  return JSON.parse(clean.slice(start, end + 1))
}

app.post('/api/analyze', async (req, res) => {
  const { selections, baseline, context } = req.body || {}

  if (!Array.isArray(selections) || !baseline || !isNum(baseline.score) || !baseline.sectors) {
    return res.status(400).json({ error: 'bad request' })
  }
  if (!API_KEY) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY is not set' })
  }

  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), 40000)

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildUserMessage({ selections, baseline, context }) }],
      }),
      signal: ctl.signal,
    })

    if (!r.ok) {
      const detail = await r.text().catch(() => '')
      console.error('Anthropic API error', r.status, detail.slice(0, 300))
      return res.status(502).json({ error: 'upstream error', status: r.status })
    }

    const data = await r.json()
    const text = (data.content || []).map((b) => (b.type === 'text' ? b.text : '')).join('')
    const out = extractJson(text)

    // ולידציה: אם חסר שדה – משלימים מחישוב הבסיס
    const sectors = {}
    for (const id of SECTOR_IDS) {
      sectors[id] = isNum(out.sectors?.[id]) ? clamp(out.sectors[id]) : baseline.sectors[id]
    }

    res.json({
      score: isNum(out.score) ? clamp(out.score) : baseline.score,
      sectors,
      headline: typeof out.headline === 'string' ? out.headline.trim() : '',
      paragraph: typeof out.paragraph === 'string' ? out.paragraph.trim() : '',
      tighten: typeof out.tighten === 'string' ? out.tighten.trim() : '',
    })
  } catch (e) {
    console.error('analyze failed:', e.message)
    res.status(502).json({ error: 'analysis failed' })
  } finally {
    clearTimeout(timer)
  }
})

app.listen(PORT, () => {
  console.log(`shelter-compass server on http://localhost:${PORT}  (AI: ${API_KEY ? 'on' : 'OFF – set ANTHROPIC_API_KEY'})`)
})
