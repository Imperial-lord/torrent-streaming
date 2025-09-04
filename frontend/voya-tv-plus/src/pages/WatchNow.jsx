import { Skeleton, PosterSkeleton } from '../components/Skeleton.jsx'
import { useEffect, useState, useMemo } from 'react'
import { getHomeRails, listMovies } from '../api/client.js'
import RailCarousel from '../components/RailCarousel.jsx'
import HeroBillboard from '../components/HeroBillboard.jsx'
import { useNavigate } from 'react-router-dom'
import useUpNext from '../hooks/useUpNext.js'

export default function WatchNow() {
  const [rails, setRails] = useState(null)
  const [allMovies, setAllMovies] = useState(null)
  const nav = useNavigate()
  const { ids: upnextIds } = useUpNext()

  useEffect(() => {
    getHomeRails().then(setRails).catch(console.error)
    listMovies().then(setAllMovies).catch(console.error)
  }, [])

  const upNextItems = (allMovies || []).filter((m) => upnextIds.includes(m.id))

  const hero = useMemo(() => {
    if (!allMovies || allMovies.length === 0) return null
    return allMovies[Math.floor(Math.random() * allMovies.length)]
  }, [allMovies])

  return (
    <main>
      {!rails || !allMovies ? (
        <>
          <div className="relative mx-auto max-w-6xl px-4 mt-6">
            <Skeleton className="h-[46vw] max-h-[520px] min-h-[280px] rounded-3xl" />
          </div>
          <div className="mx-auto max-w-6xl px-4 my-6">
            <Skeleton className="h-5 w-40 mb-3" />
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 8 }).map((_, i) => (
                <PosterSkeleton key={i} />
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {hero && (
            <HeroBillboard
              id={hero.id}
              title={hero.title}
              plot={hero.plot}
              image={hero.backdrop || hero.poster}
              cta="Play Now"
              onPlay={() => nav(`/play/${hero.id}`)}
            />
          )}

          {/* Up Next only when there are saved titles */}
          {upNextItems.length > 0 && (
            <RailCarousel
              key="rail-upnext"
              title="Up Next"
              items={upNextItems}
              onItem={(it) => nav(`/title/${it.id}`)}
            />
          )}

          {/* other rails from getHomeRails */}
          {rails.map((rail) => (
            <RailCarousel
              key={rail.id}
              title={rail.title}
              items={rail.items}
              onItem={(it) => nav(`/title/${it.id}`)}
            />
          ))}
        </>
      )}
    </main>
  )
}
