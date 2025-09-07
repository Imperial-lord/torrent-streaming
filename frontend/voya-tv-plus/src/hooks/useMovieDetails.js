import { useEffect, useState } from 'react'
import { getMovie } from '../api/client.js'

export default function useMovieDetails(id) {
  const [movie, setMovie] = useState(null)
  const [resumeAt, setResumeAt] = useState(0)

  useEffect(() => {
    getMovie(id).then(setMovie).catch(console.error)
  }, [id])

  useEffect(() => {
    if (!movie) return
    const key = `watchpos:${movie.id}`
    const read = () => {
      const s = Number(localStorage.getItem(key) || 0)
      setResumeAt(Number.isFinite(s) && s > 0 ? s : 0)
    }
    read()
    const onStorage = (e) => {
      if (e.key === key) read()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [movie])

  return { movie, resumeAt }
}
