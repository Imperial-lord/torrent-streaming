// Parse a minimal WEBVTT (timestamps + text; supports <i>, <b>, <u>, line breaks)
export function parseVTT(vtt) {
  const lines = vtt.replace(/\r/g, '').split('\n')
  const cues = []
  let i = 0
  const ts = (s) => {
    const m = s.trim().match(/(?:(\d+):)?(\d{2}):(\d{2})(?:[.,](\d{1,3}))?/)
    if (!m) return 0
    const h = Number(m[1] || 0),
      mi = Number(m[2] || 0),
      se = Number(m[3] || 0),
      ms = Number(m[4] || 0)
    return h * 3600 + mi * 60 + se + ms / 1000
  }
  while (i < lines.length) {
    if (!lines[i] || /^WEBVTT/i.test(lines[i])) {
      i++
      continue
    }
    if (lines[i] && !lines[i].includes('-->') && lines[i + 1] && lines[i + 1].includes('-->')) i++
    if (lines[i] && lines[i].includes('-->')) {
      const [a, b] = lines[i].split('-->')
      const start = ts(a),
        end = ts(b)
      i++
      const text = []
      while (i < lines.length && lines[i]) {
        text.push(lines[i])
        i++
      }
      const html = text
        .join('\n')
        .replace(/</g, (m) => m) // allow vtt basic tags
        .replace(/\n/g, '<br/>')
      cues.push({ start, end, html })
    }
    while (i < lines.length && !lines[i]) i++
  }
  return cues
}

// Find cue index near current time (stable + fast)
export function findCueIndex(cues, t, last = -1) {
  if (!cues.length) return -1
  if (last >= 0) {
    const c = cues[last]
    if (t >= c.start && t < c.end) return last
    const next = cues[last + (t >= c.end ? 1 : -1)]
    if (next && t >= next.start && t < next.end) return last + (t >= c.end ? 1 : -1)
  }
  let lo = 0,
    hi = cues.length - 1,
    ans = -1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const c = cues[mid]
    if (t < c.start) hi = mid - 1
    else if (t >= c.end) lo = mid + 1
    else {
      ans = mid
      break
    }
  }
  return ans
}
