export function fmt(s) {
  if (!isFinite(s)) return '—:—'
  const h = Math.floor(s / 3600)
  const m2 = Math.floor((s % 3600) / 60)
  const s2 = Math.floor(s % 60)
  const pad = (n) => (n < 10 ? `0${n}` : `${n}`)
  return h > 0 ? `${h}:${pad(m2)}:${pad(s2)}` : `${m2}:${pad(s2)}`
}
