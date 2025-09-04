const K = 'upnext:ids'

function read() {
  try {
    return JSON.parse(localStorage.getItem(K) || '[]')
  } catch {
    return []
  }
}
function write(ids) {
  localStorage.setItem(K, JSON.stringify(ids))
  // notify all tabs/components
  window.dispatchEvent(new CustomEvent('upnext:changed', { detail: ids }))
}

export const getUpNext = () => read()
export const inUpNext = (id) => read().includes(id)

export function addToUpNext(id) {
  const set = new Set(read())
  set.add(id)
  write([...set])
  return [...set]
}
export function removeFromUpNext(id) {
  const set = new Set(read())
  set.delete(id)
  write([...set])
  return [...set]
}
export function toggleUpNext(id) {
  const set = new Set(read())
  set.has(id) ? set.delete(id) : set.add(id)
  write([...set])
  return [...set]
}

// keep other tabs in sync (if you ever open multiple windows)
window.addEventListener('storage', (e) => {
  if (e.key === K) {
    const ids = read()
    window.dispatchEvent(new CustomEvent('upnext:changed', { detail: ids }))
  }
})
