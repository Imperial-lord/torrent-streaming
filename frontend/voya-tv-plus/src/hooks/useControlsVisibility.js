import { useCallback, useEffect, useRef, useState } from 'react'

export default function useControlsVisibility(isLoading, isBuffering) {
  const hideTimer = useRef(null)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [cursorHidden, setCursorHidden] = useState(false)

  const showControls = useCallback(
    (persist = false) => {
      setControlsVisible(true)
      setCursorHidden(false)
      if (hideTimer.current) clearTimeout(hideTimer.current)
      if (isLoading || isBuffering || persist) return
      hideTimer.current = setTimeout(() => {
        setControlsVisible(false)
        setCursorHidden(true)
      }, 1500)
    },
    [isLoading, isBuffering]
  )

  useEffect(() => {
    const onMove = () => showControls()
    window.addEventListener('mousemove', onMove)
    setControlsVisible(true)
    setCursorHidden(false)
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [showControls])

  useEffect(() => {
    if (!isLoading && !isBuffering) showControls()
  }, [isLoading, isBuffering, showControls])

  return { controlsVisible, cursorHidden, showControls }
}
