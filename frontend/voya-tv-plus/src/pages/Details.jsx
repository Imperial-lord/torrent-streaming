import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getMovie } from '../api/client.js'
import {
  Play, Download, Clock, Star, Captions
} from 'lucide-react'

export default function Details() {
  const { id } = useParams()
  const [m, setM] = useState(null)
  const [resumeAt, setResumeAt] = useState(0)
  const nav = useNavigate()

  // read saved watch position and keep it fresh if it changes (e.g., another tab)
  useEffect(() => {
    if (!m) return
    const key = `watchpos:${m.id}`
    const read = () => {
      const s = Number(localStorage.getItem(key) || 0)
      setResumeAt(Number.isFinite(s) && s > 0 ? s : 0)
    }
    read()
    const onStorage = (e) => { if (e.key === key) read() }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [m])

  useEffect(() => { getMovie(id).then(setM).catch(console.error) }, [id])
  if (!m) return null

  const omdb = m.raw?.omdbResponse ?? {}
  const safe = v => (v && v !== 'N/A' ? v : '')
  const year = safe(omdb.Year)
  const rated = safe(omdb.Rated)
  const runtime = safe(omdb.Runtime)
  const genres = (omdb.Genre || '').split(',').map(s => s.trim()).filter(Boolean)
  const director = safe(omdb.Director)
  const writer = safe(omdb.Writer)
  const actors = safe(omdb.Actors)
  const language = safe(omdb.Language)
  const country = safe(omdb.Country)
  const imdbRating = safe(omdb.imdbRating)
  const plot = safe(omdb.Plot)
  const hasSubs = !!m.subtitles

  const fmt = (s) => {
    if (!Number.isFinite(s) || s <= 0) return '0:00'
    const h = Math.floor(s / 3600)
    const m2 = Math.floor((s % 3600) / 60)
    const s2 = Math.floor(s % 60)
    const pad = n => (n < 10 ? `0${n}` : `${n}`)
    return h > 0 ? `${h}:${pad(m2)}:${pad(s2)}` : `${m2}:${pad(s2)}`
  }

  return (
    <main>
      {/* HERO IMAGE */}
      <section className="relative">
        <img
          src={m.backdrop || m.poster}
          alt=""
          className="w-full max-h-[62vh] object-cover object-top"
        />
        {/* subtle gradient overlay on image only */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </section>

      {/* GRADIENT BACKGROUND - full width */}
      <section className="relative -mt-32 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)] to-transparent">
        {/* CONTENT CONTAINER - constrained width */}
        <div className="mx-auto max-w-6xl px-4 py-8 relative z-10">
          <h1 className="font-display text-3xl md:text-5xl font-semibold text-white drop-shadow-lg">
            {m.title}
          </h1>

          {/* compact meta row */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-ink-200">
            {year && <Pill>{year}</Pill>}
            {rated && <Pill>{rated}</Pill>}
            {runtime && <Pill><Clock className="w-3.5 h-3.5 mr-1 inline" />{runtime}</Pill>}
            {genres.slice(0, 3).map(g => <Pill key={g}>{g}</Pill>)}
            {hasSubs && <Pill><Captions className="w-3.5 h-3.5 mr-1 inline" />CC</Pill>}
            {imdbRating && imdbRating !== 'N/A' && (
              <Pill title="IMDb rating"><Star className="w-3.5 h-3.5 mr-1 inline" />{imdbRating}</Pill>
            )}
          </div>

          {/* actions */}
          <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center">
            <ActionPrimary onClick={() => nav(`/play/${m.id}`)} icon={Play}>
              {resumeAt > 0 ? `Resume from ${fmt(resumeAt)}` : 'Play'}
            </ActionPrimary>
            <ActionSecondary icon={Download}>Download</ActionSecondary>
          </div>

          {/* synopsis */}
          {plot && (
            <p className="mt-5 max-w-3xl leading-relaxed text-gray-800 dark:text-gray-200">
              {plot}
            </p>
          )}

          {/* credits & extra info - always visible, no more info toggle */}
          <div className="mt-5 text-sm text-ink-200 flex flex-wrap gap-x-6 gap-y-2">
            {director && <Meta label="Director" value={director} />}
            {actors && <Meta label="Cast" value={actors} />}
            {writer && <Meta label="Writer" value={writer} />}
            {language && <Meta label="Language" value={language} />}
            {country && <Meta label="Country" value={country} />}
          </div>
        </div>
      </section>
    </main>
  )
}

/* --- helpers --- */
function Pill({ children, title }) {
  return (
    <span
      title={title}
      className="px-2 py-1 rounded-md bg-ink-800/60 text-ink-100 text-xs inline-flex items-center"
    >
      {children}
    </span>
  )
}

function ActionPrimary({ children, icon: Icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "inline-flex items-center justify-center gap-2",
        "px-5 py-3 rounded font-medium transition shadow-sm",
        // light mode
        "bg-gray-900 text-white hover:bg-black",
        // dark mode inversion
        "dark:bg-white dark:text-gray-900 dark:hover:bg-white/90",
        // a11y
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900 dark:focus-visible:ring-white dark:focus-visible:ring-offset-gray-900/0",
        "active:scale-[0.99]"
      ].join(" ")}
    >
      {Icon && <Icon className="w-5 h-5" />} {children}
    </button>
  )
}

function ActionSecondary({ children, icon: Icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "inline-flex items-center justify-center gap-2",
        "px-5 py-3 rounded transition",
        // light mode outline that can go solid on hover
        "ring-1 ring-gray-900/60 text-gray-900 hover:bg-gray-900 hover:text-white",
        // dark mode subtle outline
        "dark:ring-1 dark:ring-white/70 dark:text-white dark:hover:bg-white/10",
        // a11y
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900 dark:focus-visible:ring-white dark:focus-visible:ring-offset-gray-900/0",
        "active:scale-[0.99]"
      ].join(" ")}
    >
      {Icon && <Icon className="w-5 h-5" />} {children}
    </button>
  )
}

function Meta({ label, value }) {
  return (
    <div className="inline-flex items-baseline gap-1">
      <span className="text-gray-600 dark:text-gray-400">{label}:</span>
      <span className="text-gray-900 dark:text-gray-100">{value}</span>
    </div>
  )
}