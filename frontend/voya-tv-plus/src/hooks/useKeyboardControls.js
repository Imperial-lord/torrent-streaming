import { useEffect } from 'react'

export default function useKeyboardControls(videoRef, ensureFullscreen, setMuted, showControls) {
  useEffect(() => {
    function onKey(e) {
      const v = videoRef.current
      if (!v) return
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return
      if (e.code === 'Space') {
        e.preventDefault()
        v.paused ? v.play() : v.pause()
      }
      if (e.key === 'ArrowRight')
        v.currentTime = Math.min(v.currentTime + 10, v.duration || v.currentTime + 10)
      if (e.key === 'ArrowLeft') v.currentTime = Math.max(v.currentTime - 10, 0)
      if (e.key.toLowerCase() === 'f') ensureFullscreen()
      if (e.key.toLowerCase() === 'm') {
        v.muted = !v.muted
        setMuted(v.muted)
      }
      showControls()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [videoRef, ensureFullscreen, setMuted, showControls])
}
