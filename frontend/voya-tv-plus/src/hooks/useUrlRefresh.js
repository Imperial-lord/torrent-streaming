import { useEffect } from 'react'
import { getVideoUrl } from '../api/client.js'

export function useParUrlRefresh(movie, setVideoUrl) {
  useEffect(() => {
    if (!movie?.videoPath) return
    let timer
    const fetchUrl = async () => {
      try {
        const url = await getVideoUrl(movie.videoPath)
        setVideoUrl((prev) => (prev !== url ? url : prev))
        timer = setTimeout(fetchUrl, 40 * 60 * 1000) // 40 minutes
      } catch (err) {
        console.error('Video URL refresh error', err)
        timer = setTimeout(fetchUrl, 5 * 1000) // retry
      }
    }
    fetchUrl()
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [movie?.videoPath, setVideoUrl])
}

export function useResumeAfterUrlChange({
  videoRef,
  videoUrl,
  duration,
  paused,
  setTime,
  setProgress,
  setPaused,
  isFirstLoadRef,
  lastSavedTimeRef,
  isRefreshingRef,
}) {
  useEffect(() => {
    const v = videoRef.current
    if (!v || !videoUrl) return
    if (isFirstLoadRef.current) return

    const wasPaused = paused
    const savedTime = lastSavedTimeRef.current || v.currentTime || 0

    isRefreshingRef.current = true
    setTime(savedTime)
    setProgress(duration ? savedTime / duration : 0)

    const handleLoad = () => {
      v.currentTime = savedTime
      isRefreshingRef.current = false
      if (!wasPaused) {
        v.play().catch((err) => console.debug('Autoplay prevented:', err))
      } else {
        v.pause()
        setPaused(true)
      }
    }

    v.addEventListener('canplay', handleLoad, { once: true })
    return () => v.removeEventListener('canplay', handleLoad)
  }, [
    videoRef,
    videoUrl,
    duration,
    paused,
    setTime,
    setProgress,
    setPaused,
    isFirstLoadRef,
    lastSavedTimeRef,
    isRefreshingRef,
  ])
}
