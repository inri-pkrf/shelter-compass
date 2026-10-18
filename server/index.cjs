// שרת קטן שמחזיק את מפתח ה-API בצד השרת (הוא לא נחשף לדפדפן של הטוטם).
require('dotenv').config()
const express = require('express')

const app = express()
app.use(express.json({ limit: '1mb' }))

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5'

const SYSTEM = `אתה אנליסט תומך-החלטה עבור בעלי תפקידים שקובעים מדיניות התגוננות לאוכלוסייה בישראל.
העיקרון המנחה (פיקוד העורף): איזון בין מאמץ הצלת חיים ושמירתם לבין שגרת חירום סבירה התומכת בחוסן האוכלוסייה.
ארבעה מדרגי מדיניות: 1 פעילות מלאה, 2 פעילות חלקית, 3 פעילות מצומצמת, 4 פעילות הכרחית בלבד.
ארבעה מגזרים: essential (עובדי משק חיוני), work (מקומות עבודה כלליים), gather (התקהלויות ושירותים), edu (פעילות חינוכית).
ציון 0 = חזרה מלאה לשגרה (ירוק). ציון 100 = התגוננות מרבית והישארות בבית (אדום).
תמונת המצב (context) כוללת: היום במערכה, הצדדים, מדיניות קודמת, המגבלות הנוכחיות בכל מגזר, סבירות הגברת האיום ומגמת האיום. הפסקה צריכה להתחיל בנקודת המוצא הזו, ולציין אם ההמלצה היא הקלה, החמרה או המשך המדיניות הקודמת, ולהתייחס לסבירות ההגברה. מעבר של יותר ממדרג אחד בבת אחת הוא חריג – ציין זאת.
הציון משקף את דירוג הקריטיות שהמשתמש נתן לכל נתון, ולא את דעתך על המצב המבצעי. אל תמציא נתונים עובדתיים על המצב בשטח.
החזר JSON בלבד, בלי טקסט נוסף ובלי גדרות קוד, במבנה:
{"score":0-100,"sectors":{"essential":0-100,"work":0-100,"gather":0-100,"edu":0-100},"headline":"עד 5 מילים","paragraph":"..."}
שדה paragraph הוא משפט אחד בלבד (עד 30 מילים), שמתחיל בדיוק ב: "לאחר עיבוד נתונים מעמיק, המלצת ה-AI להתגוננות היא" וממשיך בשם המדרג המומלץ, ובקצרה: האם זו הקלה, החמרה או המשך המדיניות הקודמת, ומה המגזרים המרכזיים. בלי רשימות ובלי שורות נוספות.
סטה מהחישוב הבסיסי (baseline) ב-15 נקודות לכל היותר, ורק אם יש לכך הצדקה בדירוג.`

app.post('/api/analyze', async (req, res) => {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return res.status(503).json({ error: 'ANTHROPIC_API_KEY is not set' })
  try {
    const { selections, baseline, context } = req.body
    const userMsg =
      `דירוגי המשתמש (rating 1-5, lean חיובי = מושך להתגוננות, שלילי = מושך לשגרה):\n` +
      JSON.stringify(selections, null, 1) +
      `\n\nחישוב בסיסי (baseline):\n` + JSON.stringify(baseline) +
      `\n\nתמונת מצב (context):\n` + JSON.stringify(context, null, 1)

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1200,
        system: SYSTEM,
        messages: [{ role: 'user', content: userMsg }],
      }),
    })
    if (!r.ok) throw new Error(`Anthropic API ${r.status}: ${await r.text()}`)
    const data = await r.json()
    const text = data.content.filter((b) => b.type === 'text').map((b) => b.text).join('')
    const json = JSON.parse(text.match(/\{[\s\S]*\}/)[0])
    res.json(json)
  } catch (e) {
    console.error(e)
    res.status(502).json({ error: String(e.message || e) })
  }
})

const port = process.env.PORT || 8787
app.listen(port, () => console.log(`API server on http://localhost:${port}`))