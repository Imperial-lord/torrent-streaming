import { useEffect } from 'react'

export default function useSyncVolume(videoRef, volume, muted) {
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.volume = volume
    v.muted = muted
  }, [videoRef, volume, muted])
}
