import { useEffect } from 'react'

export default function useResumePosition(id, posKey, setResumeAt, setTime, setShowResumeToast) {
  useEffect(() => {
    const saved = Number(localStorage.getItem(posKey) || 0)
    if (saved > 0) {
      setResumeAt(saved)
      setTime(saved)
      setShowResumeToast(true)
      const t = setTimeout(() => setShowResumeToast(false), 1800)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])
}
