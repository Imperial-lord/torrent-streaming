import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getMovie, getSubtitlesText, getVideoUrl } from '../api/client.js'
import {
  Play, Pause, RotateCcw, RotateCw,
  Volume1, Volume2, VolumeX,
  Captions, Languages, Loader2
} from 'lucide-react'

export default function Player() {
  const { id } = useParams()
  const [m, setM] = useState(null)
  const [paused, setPaused] = useState(true)
  const [progress, setProgress] = useState(0)     // 0..1
  const [duration, setDuration] = useState(0)
  const [time, setTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [videoUrl, setVideoUrl] = useState(null)

  const [controlsVisible, setControlsVisible] = useState(true)
  const [cursorHidden, setCursorHidden] = useState(false)

  // loading/buffering + resume UX
  const [isLoading, setIsLoading] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)
  const [resumeAt, setResumeAt] = useState(0)
  const [showResumeToast, setShowResumeToast] = useState(false)

  // --- Manual Subtitles ---
  const [ccOn, setCcOn] = useState(true)
  const [cues, setCues] = useState([])        // [{start,end,html}]
  const [cueIdx, setCueIdx] = useState(-1)    // current cue index
  // ------------------------

  const hideTimer = useRef(null)
  const wrapRef = useRef(null)
  const videoRef = useRef(null)
  const posKey = `watchpos:${id}`

  // Add refs to track URL refresh state
  const isFirstLoad = useRef(true)
  const lastSavedTime = useRef(0)
  const isRefreshing = useRef(false)

  useEffect(() => { getMovie(id).then(setM).catch(console.error) }, [id])

  // read saved position early so UI shows resume right away
  useEffect(() => {
    const saved = Number(localStorage.getItem(posKey) || 0)
    if (saved > 0) {
      setResumeAt(saved)
      setTime(saved)
      setShowResumeToast(true)
      const t = setTimeout(() => setShowResumeToast(false), 1800)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Fetch & parse VTT when movie is ready (manual subtitles)
  useEffect(() => {
    if (!m?.subtitles) { setCues([]); return }
    getSubtitlesText(m.id)
      .then(text => setCues(parseVTT(text)))
      .catch(err => { console.error('VTT load error', err); setCues([]) })
  }, [m])

  // keyboard controls
  useEffect(() => {
    function onKey(e) {
      const v = videoRef.current; if (!v) return
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return
      if (e.code === 'Space') { e.preventDefault(); v.paused ? v.play() : v.pause() }
      if (e.key === 'ArrowRight') v.currentTime = Math.min(v.currentTime + 10, v.duration || v.currentTime + 10)
      if (e.key === 'ArrowLeft') v.currentTime = Math.max(v.currentTime - 10, 0)
      if (e.key.toLowerCase() === 'f') ensureFullscreen()
      if (e.key.toLowerCase() === 'm') { v.muted = !v.muted; setMuted(v.muted) }
      showControls()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const ensureFullscreen = async () => {
    const el = wrapRef.current; if (!el) return
    try { if (!document.fullscreenElement) await el.requestFullscreen?.() } catch { }
  }
  useEffect(() => {
    ensureFullscreen()
    const onChange = () => { }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  // playback wiring
  useEffect(() => {
    const v = videoRef.current; if (!v) return

    const onLoadedMeta = () => {
      setDuration(v.duration || 0)

      // Only set initial position on first load
      if (isFirstLoad.current) {
        if (resumeAt > 5 && isFinite(v.duration)) {
          v.currentTime = Math.min(resumeAt, Math.max(0, v.duration - 0.25))
          setTime(v.currentTime)
        }
        isFirstLoad.current = false
      } else {
        // On URL refresh, restore the last saved position
        if (lastSavedTime.current > 0 && isFinite(v.duration)) {
          v.currentTime = Math.min(lastSavedTime.current, Math.max(0, v.duration - 0.25))
          // console.log(`✅ Restored playback at ${Math.floor(v.currentTime)}s after URL refresh`)
        }
      }
    }

    const onTime = () => {
      const t = v.currentTime || 0

      // Don't update time to 0 during URL refresh
      if (isRefreshing.current && t === 0) {
        return
      }

      setTime(t)
      setDuration(v.duration || 0)
      setProgress(v.duration ? t / v.duration : 0)

      // Save position to both localStorage and ref
      lastSavedTime.current = t
      localStorage.setItem(posKey, String(t))

      // update subtitle cue index efficiently
      if (cues.length) {
        const i = findCueIndex(cues, t, cueIdx)
        if (i !== cueIdx) setCueIdx(i)
      }
    }

    const onPlay = () => { setPaused(false); setIsLoading(false); setIsBuffering(false); showControls() }
    const onPause = () => { setPaused(true); showControls(true) }
    const onVolume = () => { setVolume(v.volume); setMuted(v.muted) }
    const onWaiting = () => { setIsBuffering(true); setControlsVisible(true); setCursorHidden(false) }
    const onCanPlay = () => { setIsLoading(false); setIsBuffering(false) }

    v.addEventListener('loadedmetadata', onLoadedMeta)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    v.addEventListener('volumechange', onVolume)
    v.addEventListener('waiting', onWaiting)
    v.addEventListener('playing', onCanPlay)
    v.addEventListener('canplay', onCanPlay)

    return () => {
      v.removeEventListener('loadedmetadata', onLoadedMeta)
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
      v.removeEventListener('volumechange', onVolume)
      v.removeEventListener('waiting', onWaiting)
      v.removeEventListener('playing', onCanPlay)
      v.removeEventListener('canplay', onCanPlay)
    }
  }, [m, resumeAt, cues, cueIdx])

  useEffect(() => {
    const v = videoRef.current; if (!v) return
    v.volume = volume
    v.muted = muted
  }, [volume, muted])

  // SHOW/HIDE controls + cursor
  const showControls = (persist = false) => {
    setControlsVisible(true)
    setCursorHidden(false)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    if (isLoading || isBuffering || persist) return
    hideTimer.current = setTimeout(() => {
      setControlsVisible(false)
      setCursorHidden(true)
    }, 1500)
  }
  useEffect(() => {
    const onMove = () => showControls()
    window.addEventListener('mousemove', onMove)
    setControlsVisible(true); setCursorHidden(false)
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [isLoading, isBuffering])

  // Fetch initial URL and set up refresh timer
  useEffect(() => {
    if (!m?.videoPath) return

    let timer
    const fetchUrl = async () => {
      try {
        const url = await getVideoUrl(m.videoPath)
        // console.log("Fetching new PAR URL")

        // Only update if URL actually changed
        setVideoUrl(prevUrl => {
          if (prevUrl !== url) {
            // console.log("URL changed, updating video source")
            return url
          }
          // console.log("URL unchanged, skipping update")
          return prevUrl
        })

        // Schedule next refresh
        timer = setTimeout(fetchUrl, 40 * 60 * 1000) // 40 minutes
      } catch (err) {
        console.error("Video URL refresh error", err)
        // Retry after error
        timer = setTimeout(fetchUrl, 5 * 1000) // 5 seconds on error
      }
    }

    fetchUrl()
    return () => { if (timer) clearTimeout(timer) }
  }, [m?.videoPath])

  // Handle URL changes more carefully
  useEffect(() => {
    const v = videoRef.current
    if (!v || !videoUrl) return

    // Skip if this is the first load (handled by loadedmetadata)
    if (isFirstLoad.current) return

    const wasPaused = paused
    const savedTime = lastSavedTime.current || v.currentTime || 0

    // console.log(`🔄 URL changed, saving position: ${Math.floor(savedTime)}s, paused: ${wasPaused}`)

    // Mark that we're refreshing
    isRefreshing.current = true

    // Keep the UI showing the saved time during refresh
    setTime(savedTime)
    setProgress(duration ? savedTime / duration : 0)

    // Set up handler for when new video loads
    const handleLoad = () => {
      v.currentTime = savedTime
      isRefreshing.current = false

      // Only play if it wasn't paused before the refresh
      if (!wasPaused) {
        v.play().catch(err => console.debug("Autoplay prevented:", err))
      } else {
        // Ensure it stays paused
        v.pause()
        setPaused(true)
      }

      // console.log(`✅ Resumed at ${Math.floor(v.currentTime)}s after URL refresh (${wasPaused ? 'paused' : 'playing'})`)
    }

    // Use canplay instead of loadedmetadata for more reliable resumption
    v.addEventListener('canplay', handleLoad, { once: true })

    return () => {
      v.removeEventListener('canplay', handleLoad)
    }
  }, [videoUrl, duration])

  if (!m) return null
  const topGenre = m.genres?.[0]
  const VolumeIcon = muted ? VolumeX : (volume < 0.5 ? Volume1 : Volume2)
  const loadingActive = isLoading || isBuffering

  const fmt = (s) => {
    if (!isFinite(s)) return '—:—'
    const h = Math.floor(s / 3600)
    const m2 = Math.floor((s % 3600) / 60)
    const s2 = Math.floor(s % 60)
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`)
    return h > 0 ? `${h}:${pad(m2)}:${pad(s2)}` : `${m2}:${pad(s2)}`
  }
  const seekTo = (p) => {
    const v = videoRef.current; if (!v || !isFinite(v.duration)) return
    v.currentTime = p * v.duration
    showControls(true)
  }

  return (
    <main className="fixed inset-0 bg-black" onClick={ensureFullscreen}>
      <div
        ref={wrapRef}
        className={`relative w-full h-full bg-black overflow-hidden ${loadingActive ? '' : (cursorHidden ? 'cursor-none' : '')}`}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          crossOrigin="anonymous"
          preload="metadata"
          className="absolute inset-0 w-full h-full object-contain"
          controls={false}
          autoPlay
        />

        {/* Loading / buffering spinner */}
        {loadingActive && (
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <div className="flex items-center gap-3 px-3 py-2 rounded-full bg-white/10 text-white">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">{isLoading ? 'Loading…' : 'Buffering…'}</span>
            </div>
          </div>
        )}

        {/* Resume toast */}
        {showResumeToast && !loadingActive && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="px-4 py-2 rounded-full bg-black/70 text-white text-sm">
              Resuming at {fmt(resumeAt)}
            </div>
          </div>
        )}

        {/* --- Manual Captions Overlay --- */}
        {ccOn && cueIdx >= 0 && cues[cueIdx] && (
          <div
            className={`
              absolute left-1/2 -translate-x-1/2
              bottom-16 md:bottom-20 lg:bottom-24
              max-w-[90%] md:max-w-[75%] lg:max-w-[60%]
              text-center px-3 py-2 rounded-md
              bg-black/60 text-white
            `}
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
              fontWeight: 500,
              lineHeight: 1.35,
              fontSize: 'clamp(0.9rem, 1.6vw, 1.2rem)',
            }}
            dangerouslySetInnerHTML={{ __html: cues[cueIdx].html }}
          />
        )}
        {/* -------------------------------- */}

        <div className={`absolute inset-0 transition-opacity duration-300 ${controlsVisible || loadingActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {/* TOP BAR */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-none select-none">
            <div className="flex items-center gap-4 text-white/90 text-sm pointer-events-auto">
              {m.rating && <Badge>{m.rating}</Badge>}
              {m.rating && topGenre && <div className="h-5 w-px bg-white/40" />}
              {topGenre && <div className="opacity-90">{topGenre}</div>}
            </div>
            <div className="pointer-events-auto flex items-center gap-3">
              <button
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                onClick={() => { const v = videoRef.current; if (!v) return; v.muted = !v.muted; setMuted(v.muted); showControls(true) }}
                aria-label="Mute"
                title="Mute"
              >
                <VolumeIcon className="w-5 h-5" />
              </button>
              <input
                type="range"
                min="0" max="1" step="0.01"
                value={muted ? 0 : volume}
                onChange={(e) => { setMuted(false); setVolume(parseFloat(e.target.value)); showControls(true) }}
                className="w-44 accent-white/90"
                aria-label="Volume"
              />
            </div>
          </div>

          {/* CENTER CONTROLS */}
          {!isBuffering && !isLoading && <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <div className="flex items-center gap-10 pointer-events-auto">
              <Ctl onClick={() => { const v = videoRef.current; if (!v) return; v.currentTime = Math.max(0, v.currentTime - 10); showControls(true) }} aria="Back 10">
                <RotateCcw className="w-6 h-6" />
                <span className="absolute bottom-5.5 text-[6px]">10</span>
              </Ctl>

              <Ctl onClick={() => { const v = videoRef.current; if (!v) return; v.paused ? v.play() : v.pause(); showControls(true) }} aria={paused ? 'Play' : 'Pause'} big>
                {paused ? <Play className="w-12 h-12" /> : <Pause className="w-12 h-12" />}
              </Ctl>

              <Ctl onClick={() => { const v = videoRef.current; if (!v) return; v.currentTime = Math.min((v.duration || v.currentTime + 10), v.currentTime + 10); showControls(true) }} aria="Forward 10">
                <RotateCw className="w-6 h-6" />
                <span className="absolute bottom-5.5 text-[6px]">10</span>
              </Ctl>
            </div>
          </div>}

          {/* BOTTOM BAR */}
          <div className="absolute left-6 right-6 bottom-6 text-white select-none pointer-events-none">
            <div className="text-lg font-medium mb-2">{m.title}</div>
            <div
              className="relative h-1.5 bg-white/20 rounded-full overflow-hidden mb-2 pointer-events-auto"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const p = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
                seekTo(p)
              }}
            >
              <div className="absolute inset-y-0 left-0 bg-white rounded-full" style={{ width: `${progress * 100}%` }} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-white/70">
              <span>{fmt(time || resumeAt || 0)}</span>
              <span>-{fmt(isFinite(duration) && duration > 0 ? (duration - (time || 0)) : NaN)}</span>
            </div>
          </div>

          {/* BOTTOM RIGHT */}
          <div className="absolute bottom-16 right-6 flex items-center gap-3 pointer-events-auto">
            {cues.length > 0 && (
              <Small onClick={() => { setCcOn(v => !v); showControls(true) }} title="Subtitles">
                <Captions className="w-5 h-5" />
                <span className="text-xs">{ccOn ? 'On' : 'Off'}</span>
              </Small>
            )}
            <Small onClick={() => { /* audio menu later */ showControls(true) }} title="Audio">
              <Languages className="w-5 h-5" />
            </Small>
          </div>
        </div>
      </div>
    </main>
  )
}

/* ---------- helpers ---------- */
function Badge({ children }) {
  return <span className="px-2 py-1 rounded-md bg-white/10 border border-white/20 text-white/90">{children}</span>
}
function Ctl({ children, onClick, aria, big = false }) {
  return (
    <button
      onClick={onClick}
      aria-label={aria}
      className={`relative rounded-full ${big ? 'p-4' : 'p-3'} bg-white/15 hover:bg-white/25 active:scale-95 transition grid place-items-center text-white`}
    >
      {children}
    </button>
  )
}
function Small({ children, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
    >
      {children}
    </button>
  )
}

// Parse a minimal WEBVTT (timestamps + text; supports <i>, <b>, <u>, line breaks)
function parseVTT(vtt) {
  const lines = vtt.replace(/\r/g, '').split('\n')
  const cues = []
  let i = 0
  const ts = s => {
    const m = s.trim().match(/(?:(\d+):)?(\d{2}):(\d{2})(?:[.,](\d{1,3}))?/)
    if (!m) return 0
    const h = Number(m[1] || 0), mi = Number(m[2] || 0), se = Number(m[3] || 0), ms = Number(m[4] || 0)
    return h * 3600 + mi * 60 + se + ms / 1000
  }
  while (i < lines.length) {
    // skip empty / header
    if (!lines[i] || /^WEBVTT/i.test(lines[i])) { i++; continue }
    // optional cue id line
    if (lines[i] && !lines[i].includes('-->') && lines[i + 1] && lines[i + 1].includes('-->')) i++
    // time line
    if (lines[i] && lines[i].includes('-->')) {
      const [a, b] = lines[i].split('-->')
      const start = ts(a), end = ts(b)
      i++
      const text = []
      while (i < lines.length && lines[i]) { text.push(lines[i]); i++ }
      // preserve basic tags & convert to HTML
      const html = text.join('\n')
        .replace(/</g, m => m)        // allow vtt basic tags
        .replace(/\n/g, '<br/>')
      cues.push({ start, end, html })
    }
    // skip blank between cues
    while (i < lines.length && !lines[i]) i++
  }
  return cues
}

// Find cue index near current time (stable + fast)
function findCueIndex(cues, t, last = -1) {
  if (!cues.length) return -1
  // try pocket search around last index
  if (last >= 0) {
    const c = cues[last]
    if (t >= c.start && t < c.end) return last
    const next = cues[last + (t >= c.end ? 1 : -1)]
    if (next && t >= next.start && t < next.end) return last + (t >= c.end ? 1 : -1)
  }
  // binary search
  let lo = 0, hi = cues.length - 1, ans = -1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const c = cues[mid]
    if (t < c.start) hi = mid - 1
    else if (t >= c.end) lo = mid + 1
    else { ans = mid; break }
  }
  return ans
}