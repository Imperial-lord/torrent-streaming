import { useEffect, useState } from 'react'

const K = 'upnext:ids'
const read = () => {
  try {
    return JSON.parse(localStorage.getItem(K) || '[]')
  } catch {
    return []
  }
}
const write = (ids) => {
  localStorage.setItem(K, JSON.stringify(ids))
  window.dispatchEvent(new CustomEvent('upnext:changed', { detail: ids }))
}

export const inUpNext = (id) => read().includes(id)
export const toggleUpNext = (id) => {
  const s = new Set(read())
  s.has(id) ? s.delete(id) : s.add(id)
  write([...s])
}
export default function useUpNext() {
  const [ids, setIds] = useState(read())
  useEffect(() => {
    const onChange = (e) => setIds(e.detail ?? read())
    window.addEventListener('upnext:changed', onChange)
    window.addEventListener('storage', (e) => {
      if (e.key === K) setIds(read())
    })
    return () => window.removeEventListener('upnext:changed', onChange)
  }, [])
  return { ids }
}
