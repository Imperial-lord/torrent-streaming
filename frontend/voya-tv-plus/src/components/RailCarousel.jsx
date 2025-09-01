import { motion } from 'framer-motion'
import PosterCard from './PosterCard.jsx'
import { useRef, useEffect } from 'react'

export default function RailCarousel({ title, items, onItem }) {
  const scroller = useRef(null)

  // Arrow key horizontal scroll when a child is focused
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    function onKey(e) {
      if (!el.contains(document.activeElement)) return
      const step = 260
      if (e.key === 'ArrowRight') el.scrollBy({ left: step, behavior: 'smooth' })
      if (e.key === 'ArrowLeft') el.scrollBy({ left: -step, behavior: 'smooth' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <section className="my-6">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-3 font-display text-lg text-gray-900 dark:text-gray-100">{title}</h2>
        <div
          ref={scroller}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((it, idx) => (
            <motion.div
              key={it.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02, duration: 0.2 }}
              className="snap-start"
            >
              <PosterCard item={it} onClick={() => onItem?.(it)} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}