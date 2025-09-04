import { inUpNext, toggleUpNext } from '../lib/upnext.js'

export default function HeroBillboard({ id, title, plot, image, cta, onPlay }) {
  const saved = inUpNext(id)

  return (
    <div className="relative mx-auto max-w-6xl px-4 mt-6">
      <div className="relative h-[46vw] max-h-[520px] min-h-[280px] rounded-3xl overflow-hidden ring-1 ring-ink-800">
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="font-display text-3xl md:text-5xl text-white font-semibold drop-shadow">
            {title}
          </h1>
          {plot && (
            <p className="mt-2 text-sm md:text-base text-white/70 line-clamp-3 max-w-2xl">{plot}</p>
          )}
          <div className="mt-4 flex gap-3">
            <button
              onClick={onPlay}
              className="px-5 py-2 rounded bg-ink-0 text-ink-900 font-medium"
            >
              {cta ?? 'Play'}
            </button>
            <button
              onClick={() => {
                toggleUpNext(id)
              }}
              className="px-5 py-2 rounded ring-1 ring-ink-600 hover:ring-ink-400 text-white"
            >
              {saved ? 'Remove Bookmark' : 'Watch Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
