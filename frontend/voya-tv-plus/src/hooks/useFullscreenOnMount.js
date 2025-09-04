import { useCallback, useEffect } from 'react'

export default function useFullscreenOnMount(wrapRef) {
  const ensureFullscreen = useCallback(async () => {
    const el = wrapRef.current
    if (!el) return
    try {
      if (!document.fullscreenElement) await el.requestFullscreen?.()
    } catch {}
  }, [wrapRef])

  useEffect(() => {
    ensureFullscreen()
    const onChange = () => {}
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [ensureFullscreen])

  return ensureFullscreen
}
