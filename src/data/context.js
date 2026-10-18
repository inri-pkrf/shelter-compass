export const ADVERSARIES = ['איראן', 'חיזבאללה', 'חמאס', "החות'ים", 'מיליציות בעיראק']

export const ESCALATION = [
  { n: 1, label: 'נמוכה מאוד', icon: '🕊️', color: '#2FA84F' },
  { n: 2, label: 'נמוכה', icon: '🌤️', color: '#9CC83A' },
  { n: 3, label: 'בינונית', icon: '⛅', color: '#EBA52B' },
  { n: 4, label: 'גבוהה', icon: '⛈️', color: '#E2692A' },
  { n: 5, label: 'גבוהה מאוד', icon: '🔥', color: '#D62839' },
]

export const TRENDS = [
  { id: 'down', label: 'יורדת', icon: '📉', shift: -4, color: '#2FA84F' },
  { id: 'flat', label: 'יציבה', icon: '➖', shift: 0, color: '#EBA52B' },
  { id: 'up', label: 'עולה', icon: '📈', shift: 4, color: '#D62839' },
]

export const initialContext = () => ({
  day: 1, adversaries: [], prevLevel: null, current: null, escalation: null, trend: null,
})
