import { useParams, useNavigate } from 'react-router-dom'
import { Clock, Star, Captions, Play, Download } from 'lucide-react'

import useMovieDetails from '../hooks/useMovieDetails.js'
import Pill from '../components/details/Pill.jsx'
import ActionPrimary from '../components/details/ActionPrimary.jsx'
import ActionSecondary from '../components/details/ActionSecondary.jsx'
import Meta from '../components/details/Meta.jsx'
import { fmt } from '../utils/time.js'

export default function Details() {
  const { id } = useParams()
  const nav = useNavigate()
  const { movie: m, resumeAt } = useMovieDetails(id)

  if (!m) return null

  const omdb = m.raw?.omdbResponse ?? {}
  const safe = (v) => (v && v !== 'N/A' ? v : '')
  const year = safe(omdb.Year)
  const rated = safe(omdb.Rated)
  const runtime = safe(omdb.Runtime)
  const genres = (omdb.Genre || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const director = safe(omdb.Director)
  const writer = safe(omdb.Writer)
  const actors = safe(omdb.Actors)
  const language = safe(omdb.Language)
  const country = safe(omdb.Country)
  const imdbRating = safe(omdb.imdbRating)
  const plot = safe(omdb.Plot)
  const hasSubs = !!m.subtitles

  return (
    <main className="min-h-screen">
      {/* HERO */}
      <section className="relative">
        <div className="relative w-full min-h-[64vh] max-h-[72vh]">
          <img
            src={m.backdrop || m.poster}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="eager"
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.5)_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/95 via-white/40 to-transparent dark:from-black/80 dark:via-black/20" />
        </div>
      </section>

      {/* CONTENT OVERLAY */}
      <section className="-mt-24 md:-mt-32 pb-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="relative rounded-2xl border border-black/5 bg-white/70 backdrop-blur-md shadow-lg dark:bg-black/40 dark:border-white/10 p-5 md:p-6">
            <h1 className="font-display text-3xl md:text-5xl font-semibold text-gray-900 dark:text-white drop-shadow-sm">
              {m.title}
            </h1>

            {/* meta row */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-gray-700 dark:text-gray-200">
              {year && <Pill>{year}</Pill>}
              {rated && <Pill>{rated}</Pill>}
              {runtime && (
                <Pill>
                  <Clock className="mr-1 inline h-3.5 w-3.5" />
                  {runtime}
                </Pill>
              )}
              {genres.slice(0, 3).map((g) => (
                <Pill key={g}>{g}</Pill>
              ))}
              {hasSubs && (
                <Pill>
                  <Captions className="mr-1 inline h-3.5 w-3.5" />
                  CC
                </Pill>
              )}
              {imdbRating && (
                <Pill title="IMDb rating">
                  <Star className="mr-1 inline h-3.5 w-3.5" />
                  {imdbRating}
                </Pill>
              )}
            </div>

            {/* actions */}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ActionPrimary onClick={() => nav(`/play/${m.id}`)} icon={Play}>
                {resumeAt > 0 ? `Resume from ${fmt(resumeAt)}` : 'Play'}
              </ActionPrimary>
              <ActionSecondary icon={Download}>Download</ActionSecondary>
            </div>
          </div>

          {/* synopsis */}
          {plot && (
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-gray-800 dark:text-gray-200">
              {plot}
            </p>
          )}

          {/* credits grid */}
          <div className="mt-6 grid gap-x-8 gap-y-3 text-sm text-gray-800 dark:text-gray-200 sm:grid-cols-2">
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
