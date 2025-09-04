import { useEffect, useRef, useState } from 'react'

/**
 * Visual + interactive seek bar with draggable thumb.
 * Props:
 * - duration, time, progress
 * - videoRef
 * - showControls(persist?: boolean)
 * - setTime, setProgress
 * - seekTo(p: 0..1)
 */
export default function SeekBar({
  duration,
  time,
  progress,
  videoRef,
  showControls,
  setTime,
  setProgress,
  seekTo,
}) {
  const [isScrubbing, setIsScrubbing] = useState(false)
  const [hoveringBar, setHoveringBar] = useState(false)
  const barRef = useRef(null)

  const pctToTime = (p) => {
    const v = videoRef.current
    if (!v || !isFinite(v.duration)) return 0
    return p * v.duration
  }
  const eventToPct = (clientX) => {
    const rect = barRef.current?.getBoundingClientRect()
    if (!rect) return progress || 0
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
  }

  useEffect(() => {
    const onPointerMove = (e) => {
      if (!isScrubbing) return
      showControls?.(true) // keep controls visible while dragging
      const p = eventToPct(e.clientX)
      const v = videoRef.current
      if (!v || !isFinite(v.duration)) return
      v.currentTime = pctToTime(p)
      setTime(v.currentTime)
      setProgress(p)
    }
    const onPointerUp = () => {
      if (!isScrubbing) return
      setIsScrubbing(false)
      // re-arm hide timer after drag
      showControls?.()
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [isScrubbing, videoRef, setTime, setProgress, showControls])

  return (
    <div
      ref={barRef}
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={isFinite(duration) ? duration : 0}
      aria-valuenow={time || 0}
      tabIndex={0}
      className={`
        group relative h-1.5 bg-white/20 rounded-full overflow-visible mb-2 pointer-events-auto
        focus:outline-none focus:ring-2 focus:ring-white/40
      `}
      onMouseEnter={() => setHoveringBar(true)}
      onMouseLeave={() => setHoveringBar(false)}
      onPointerDown={(e) => {
        setIsScrubbing(true)
        showControls?.(true)
        const p = eventToPct(e.clientX)
        const v = videoRef.current
        if (v && isFinite(v.duration)) {
          v.currentTime = pctToTime(p)
          setTime(v.currentTime)
          setProgress(p)
        }
        try {
          e.currentTarget.setPointerCapture(e.pointerId)
        } catch {}
      }}
      onClick={(e) => {
        const p = eventToPct(e.clientX)
        seekTo(p)
      }}
      onKeyDown={(e) => {
        const v = videoRef.current
        if (!v || !isFinite(v.duration)) return
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault()
          const delta = e.key === 'ArrowRight' ? 5 : -5
          const newTime = Math.min(Math.max(0, (v.currentTime || 0) + delta), v.duration)
          v.currentTime = newTime
          setTime(newTime)
          setProgress(v.duration ? newTime / v.duration : 0)
        }
        if (e.key === 'Home') {
          e.preventDefault()
          v.currentTime = 0
          setTime(0)
          setProgress(0)
        }
        if (e.key === 'End' && isFinite(v.duration)) {
          e.preventDefault()
          v.currentTime = v.duration
          setTime(v.duration)
          setProgress(1)
        }
      }}
    >
      {/* Filled track */}
      <div
        className="absolute inset-y-0 left-0 bg-white rounded-full"
        style={{ width: `${(progress || 0) * 100}%` }}
      />
      {/* Thumb */}
      <div
        className={`
          absolute -top-1.5
          h-4 w-4 rounded-full bg-white shadow
          transition-opacity duration-150
          ${isScrubbing || hoveringBar ? 'opacity-100' : 'opacity-0'}
          group-focus:opacity-100
        `}
        style={{
          left: `calc(${(progress || 0) * 100}% - 8px)`,
        }}
      />
    </div>
  )
}
