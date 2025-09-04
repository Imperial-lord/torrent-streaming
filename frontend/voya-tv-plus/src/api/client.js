import { apiFetch, apiBase } from './auth'

const BASE = apiBase()

const pick = (v, fallback) => (v && v !== 'N/A' ? v : fallback)

function mapMovie(m) {
  const omdb = m.omdbResponse || {}
  const tmdb = m.tmdbImageResponse || {}
  const poster = pick(tmdb.posterImageUrl, null) || pick(omdb.Poster, null)
  const backdrop = pick(tmdb.backdropImageUrl, null)

  return {
    id: m.imdbId,
    title: omdb.Title || m.imdbId,
    year: omdb.Year || '',
    rating: omdb.Rated || '',
    runtime: omdb.Runtime || '',
    genres: (omdb.Genre || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    plot: omdb.Plot || '',
    imdbRating: omdb.imdbRating || '',
    poster,
    backdrop,
    videoPath: m.videoPath,
    subtitles: m.subtitlesPath ? true : false,
    raw: m,
  }
}

export async function listMovies() {
  const res = await apiFetch(`/api/movies`)
  if (!res.ok) throw new Error('Failed to fetch movies')
  const data = await res.json()
  return data.map(mapMovie)
}

export async function getMovie(id) {
  const res = await apiFetch(`/api/movies/${id}`)
  if (!res.ok) throw new Error('Failed to fetch movie')
  const data = await res.json()
  return mapMovie(data)
}

export async function searchTitles(q) {
  const all = await listMovies()
  const ql = q.toLowerCase()
  return all.filter(
    (m) =>
      m.title.toLowerCase().includes(ql) ||
      m.genres.join(' ').toLowerCase().includes(ql) ||
      m.year.includes(q)
  )
}

export async function getHomeRails() {
  const all = await listMovies()

  const latest = [...all].sort((a, b) => (b.year || '').localeCompare(a.year || '')).slice(0, 12)

  const trending = [...all]
    .sort((a, b) => Number(b.imdbRating || 0) - Number(a.imdbRating || 0))
    .slice(0, 12)

  const byGenre = {}
  all.forEach((m) =>
    (m.genres || []).forEach((g) => {
      if (!byGenre[g]) byGenre[g] = []
      byGenre[g].push(m)
    })
  )
  const genreRails = Object.entries(byGenre)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3)
    .map(([g, items]) => ({ id: `g-${g}`, title: g, items: items.slice(0, 18) }))

  return [
    { id: 'rail-latest', title: 'Latest Releases', items: latest },
    { id: 'rail-trending', title: 'New & Noteworthy', items: trending },
    ...genreRails,
  ]
}

/** Fetches PAR URL for video */
export async function getVideoUrl(videoPath) {
  const objectName = encodeURIComponent(videoPath)
  const res = await apiFetch(`/api/video-url?objectName=${objectName}`)
  if (!res.ok) throw new Error('Failed to fetch video URL')
  const { url } = await res.json() // backend returns { url: "https://objectstorage...par..." }
  return url
}

/** Fetcher subtitles for video */
/** Get subtitles text (auth-aware) */
export async function getSubtitlesText(imdbId) {
  const res = await apiFetch(`/api/subtitles?imdbId=${encodeURIComponent(imdbId)}`, {
    headers: { Accept: 'text/vtt' },
  })
  if (!res.ok) throw new Error('Failed to fetch subtitles')
  return res.text()
}
