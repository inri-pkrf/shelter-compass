import { computeBaseline, localResult } from './engine'

const valid = (n) => typeof n === 'number' && n >= 0 && n <= 100

/** שולח לשרת (שמדבר עם Claude). אם נכשל – חוזר לחישוב מקומי. */
export async function analyze(items) {
  const baseline = computeBaseline(items)
  const selections = items.map(({ factor, rating }) => ({
    id: factor.id,
    label: factor.label,
    group: factor.group,
    lean: factor.lean,
    rating,
  }))
  try {
    const ctl = new AbortController()
    const t = setTimeout(() => ctl.abort(), 45000)
    const res = await fetch((process.env.REACT_APP_API_URL || '') + '/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selections, baseline }),
      signal: ctl.signal,
    })
    clearTimeout(t)
    if (!res.ok) throw new Error('bad status ' + res.status)
    const d = await res.json()
    if (!valid(d.score) || !d.paragraph || !d.sectors) throw new Error('bad payload')
    const sectors = {}
    for (const k of Object.keys(baseline.sectors)) {
      sectors[k] = valid(d.sectors[k]) ? Math.round(d.sectors[k]) : baseline.sectors[k]
    }
    return { score: Math.round(d.score), sectors, headline: d.headline || '', paragraph: d.paragraph, source: 'ai' }
  } catch (e) {
    console.warn('AI unavailable, using local engine:', e)
    return localResult(items, baseline)
  }
}
