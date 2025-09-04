import { useEffect } from 'react'
import { parseVTT } from '../utils/vtt.js'
import { getSubtitlesText } from '../api/client.js'

export default function useSubtitles(movie, setCues) {
  useEffect(() => {
    if (!movie?.subtitles) {
      setCues([])
      return
    }
    getSubtitlesText(movie.id)
      .then((text) => setCues(parseVTT(text)))
      .catch((err) => {
        console.error('VTT load error', err)
        setCues([])
      })
  }, [movie, setCues])
}
