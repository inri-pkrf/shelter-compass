import { useCallback, useEffect, useRef, useState } from 'react'

const request = () => document.documentElement.requestFullscreen?.().catch(() => {})

/**
 * מסך מלא תמידי.
 * דפדפנים לא מאפשרים להיכנס למסך מלא בלי נגיעה/לחיצה של המשתמש, לכן:
 *  • ננסה להיכנס מיד עם הטעינה (עובד רק אם הדפדפן מאשר, למשל במצב קיוסק).
 *  • אחרת – הנגיעה הראשונה בכל מקום במסך מכניסה למסך מלא.
 *  • אם יצאו ממסך מלא בלחיצה על הכפתור, לא נחזור אוטומטית עד שילחצו עליו שוב.
 *  • אם יצאו בדרך אחרת (למשל Esc), הנגיעה הבאה מחזירה למסך מלא.
 */
export default function useFullscreen() {
  const [isFs, setIsFs] = useState(!!document.fullscreenElement)
  const userExited = useRef(false)

  useEffect(() => {
    const onChange = () => setIsFs(!!document.fullscreenElement)
    const onTouch = (e) => {
      if (e.target.closest?.('.ctl-btn')) return // הכפתור מטפל בעצמו
      if (userExited.current || document.fullscreenElement) return
      request()
    }
    document.addEventListener('fullscreenchange', onChange)
    window.addEventListener('pointerup', onTouch)
    if (!userExited.current) request()
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      window.removeEventListener('pointerup', onTouch)
    }
  }, [])

  const toggle = useCallback(() => {
    if (document.fullscreenElement) {
      userExited.current = true
      document.exitFullscreen?.().catch(() => {})
    } else {
      userExited.current = false
      request()
    }
  }, [])

  return { isFs, toggle }
}