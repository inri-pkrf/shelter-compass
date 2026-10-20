/** כפתורי בית ומסך מלא – עיגולים בעיצוב אחיד, בכל מצבי התצוגה (טוטם, מסך רגיל, כיתה אימרסיבית). */
export const HOME_URL = 'https://inri-pkrf.github.io/Totem-Pro-Final/'

const Icon = ({ d }) => (
  <svg viewBox="0 0 48 48" aria-hidden="true"><path d={d} /></svg>
)

const HOUSE = 'M7 23 L24 8 L41 23 M11 20 V40 H37 V20 M19 40 V29 H29 V40'
const ENTER = 'M6 18 V6 H18 M30 6 H42 V18 M42 30 V42 H30 M18 42 H6 V30'
const EXIT = 'M18 6 V18 H6 M42 18 H30 V6 M30 42 V30 H42 M6 30 H18 V42'

export default function ScreenButtons({ fs }) {
  return (
    <div className="ctl">
      <button type="button" className="ctl-btn" aria-label="בית" onClick={() => window.location.assign(HOME_URL)}>
        <Icon d={HOUSE} />
      </button>
      <button type="button" className="ctl-btn" aria-label={fs?.isFs ? 'יציאה ממסך מלא' : 'מסך מלא'} onClick={() => fs?.toggle()}>
        <Icon d={fs?.isFs ? EXIT : ENTER} />
      </button>
    </div>
  )
}