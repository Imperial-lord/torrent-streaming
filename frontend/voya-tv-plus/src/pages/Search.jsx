import { useState } from 'react'
import { searchTitles } from '../api/client.js'
import PosterCard from '../components/PosterCard.jsx'
import { useNavigate } from 'react-router-dom'

export default function Search() {
  const [q, setQ] = useState('')
  const [res, setRes] = useState([])
  const nav = useNavigate()

  async function go(v) {
    setQ(v)
    if (!v) return setRes([])
    setRes(await searchTitles(v))
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <input
        placeholder="Search"
        value={q}
        onChange={(e) => go(e.target.value)}
        className="w-full rounded-full bg-[var(--card)] px-5 py-3 outline-none ring-1 ring-ink-700"
      />
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {res.map((it) => (
          <PosterCard key={it.id} item={it} onClick={() => nav(`/title/${it.id}`)} />
        ))}
      </div>
    </main>
  )
}
