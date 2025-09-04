import { useEffect } from 'react'
import { findCueIndex } from '../utils/vtt.js'

export default function usePlaybackWiring({
  videoRef,
  resumeAt,
  cues,
  cueIdx,
  setCueIdx,
  posKey,
  setDuration,
  setTime,
  setProgress,
  setPaused,
  setIsLoading,
  setIsBuffering,
  setVolume,
  setMuted,
  showControls,
  isFirstLoadRef,
  lastSavedTimeRef,
  isRefreshingRef,
}) {
  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    const onLoadedMeta = () => {
      setDuration(v.duration || 0)
      if (isFirstLoadRef.current) {
        if (resumeAt > 5 && isFinite(v.duration)) {
          v.currentTime = Math.min(resumeAt, Math.max(0, v.duration - 0.25))
          setTime(v.currentTime)
        }
        isFirstLoadRef.current = false
      } else {
        if (lastSavedTimeRef.current > 0 && isFinite(v.duration)) {
          v.currentTime = Math.min(lastSavedTimeRef.current, Math.max(0, v.duration - 0.25))
        }
      }
    }

    const onTime = () => {
      const t = v.currentTime || 0
      if (isRefreshingRef.current && t === 0) return

      setTime(t)
      setDuration(v.duration || 0)
      setProgress(v.duration ? t / v.duration : 0)

      lastSavedTimeRef.current = t
      localStorage.setItem(posKey, String(t))

      if (cues.length) {
        const i = findCueIndex(cues, t, cueIdx)
        if (i !== cueIdx) setCueIdx(i)
      }
    }

    const onPlay = () => {
      setPaused(false)
      setIsLoading(false)
      setIsBuffering(false)
      showControls()
    }
    const onPause = () => {
      setPaused(true)
      showControls(true)
    }
    const onVolume = () => {
      setVolume(v.volume)
      setMuted(v.muted)
    }
    const onWaiting = () => {
      setIsBuffering(true)
      /* force visible UI */ showControls(true)
    }
    const onCanPlay = () => {
      setIsLoading(false)
      setIsBuffering(false)
      showControls()
    }

    v.addEventListener('loadedmetadata', onLoadedMeta)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    v.addEventListener('volumechange', onVolume)
    v.addEventListener('waiting', onWaiting)
    v.addEventListener('playing', onCanPlay)
    v.addEventListener('canplay', onCanPlay)

    return () => {
      v.removeEventListener('loadedmetadata', onLoadedMeta)
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
      v.removeEventListener('volumechange', onVolume)
      v.removeEventListener('waiting', onWaiting)
      v.removeEventListener('playing', onCanPlay)
      v.removeEventListener('canplay', onCanPlay)
    }
  }, [
    videoRef,
    resumeAt,
    cues,
    cueIdx,
    setCueIdx,
    posKey,
    setDuration,
    setTime,
    setProgress,
    setPaused,
    setIsLoading,
    setIsBuffering,
    setVolume,
    setMuted,
    showControls,
    isFirstLoadRef,
    lastSavedTimeRef,
    isRefreshingRef,
  ])
}
