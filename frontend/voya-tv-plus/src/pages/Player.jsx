import { useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMovie } from '../api/client.js'
import { Volume1, Volume2, VolumeX } from 'lucide-react'

// ui pieces (already created earlier)
import LoadingOverlay from '../components/player/LoadingOverlay.jsx'
import ResumeToast from '../components/player/ResumeToast.jsx'
import TopBar from '../components/player/TopBar.jsx'
import CenterControls from '../components/player/CenterControls.jsx'
import BottomBar from '../components/player/BottomBar.jsx'
import BottomRight from '../components/player/BottomRight.jsx'
import CaptionOverlay from '../components/player/CaptionOverlay.jsx'

// hooks
import useResumePosition from '../hooks/useResumePosition.js'
import useSubtitles from '../hooks/useSubtitles.js'
import useKeyboardControls from '../hooks/useKeyboardControls.js'
import useFullscreenOnMount from '../hooks/useFullscreenOnMount.js'
import useControlsVisibility from '../hooks/useControlsVisibility.js'
import usePlaybackWiring from '../hooks/usePlaybackWiring.js'
import { useParUrlRefresh, useResumeAfterUrlChange } from '../hooks/useUrlRefresh.js'
import useSyncVolume from '../hooks/useSyncVolume.js'
import useFullscreen from '../hooks/useFullscreen.js'

// utils
import { fmt } from '../utils/time.js'

export default function Player() {
  const { id } = useParams()
  const navigate = useNavigate()

  // data / media state
  const [m, setM] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)

  // playback UI state
  const [paused, setPaused] = useState(true)
  const [progress, setProgress] = useState(0) // 0..1
  const [duration, setDuration] = useState(0)
  const [time, setTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)

  // visibility state
  const [isLoading, setIsLoading] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)
  const [resumeAt, setResumeAt] = useState(0)
  const [showResumeToast, setShowResumeToast] = useState(false)

  // subtitles state
  const [ccOn, setCcOn] = useState(true)
  const [cues, setCues] = useState([])
  const [cueIdx, setCueIdx] = useState(-1)

  // refs
  const wrapRef = useRef(null)
  const videoRef = useRef(null)
  const isFirstLoad = useRef(true)
  const lastSavedTime = useRef(0)
  const isRefreshing = useRef(false)
  const posKey = `watchpos:${id}`

  // fetch movie
  // keep as inline to avoid changing behavior (was: getMovie(id).then(setM))
  useState(() => {
    getMovie(id).then(setM).catch(console.error)
  }, [id])

  // hooks wiring
  useResumePosition(id, posKey, setResumeAt, setTime, setShowResumeToast)
  useSubtitles(m, setCues)

  const ensureFullscreen = useFullscreenOnMount(wrapRef)
  const { controlsVisible, cursorHidden, showControls } = useControlsVisibility(
    isLoading,
    isBuffering
  )
  const { isFullscreen, toggleFullscreen } = useFullscreen(wrapRef)

  useKeyboardControls(videoRef, ensureFullscreen, setMuted, showControls)
  usePlaybackWiring({
    videoRef,
    resumeAt,
    cues,
    cueIdx,
    setCueIdx,
    posKey,
    setDuration,
    setTime,
    setProgress,
    setPaused,
    setIsLoading,
    setIsBuffering,
    setVolume,
    setMuted,
    showControls,
    isFirstLoadRef: isFirstLoad,
    lastSavedTimeRef: lastSavedTime,
    isRefreshingRef: isRefreshing,
  })

  useParUrlRefresh(m, setVideoUrl)
  useResumeAfterUrlChange({
    videoRef,
    videoUrl,
    duration,
    paused,
    setTime,
    setProgress,
    setPaused,
    isFirstLoadRef: isFirstLoad,
    lastSavedTimeRef: lastSavedTime,
    isRefreshingRef: isRefreshing,
  })

  useSyncVolume(videoRef, volume, muted)

  const topGenre = m?.genres?.[0]
  const VolumeIcon = muted ? VolumeX : volume < 0.5 ? Volume1 : Volume2
  const loadingActive = isLoading || isBuffering

  const seekTo = (p) => {
    const v = videoRef.current
    if (!v || !isFinite(v.duration)) return
    v.currentTime = p * v.duration
    showControls(true)
  }

  if (!m) return null

  return (
    <main className="fixed inset-0 bg-black">
      <div
        ref={wrapRef}
        className={`relative w-full h-full bg-black overflow-hidden ${loadingActive ? '' : cursorHidden ? 'cursor-none' : ''}`}
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

        <LoadingOverlay active={loadingActive} isLoading={isLoading} />

        <ResumeToast
          show={showResumeToast && !loadingActive}
          label={`Resuming at ${fmt(resumeAt)}`}
        />

        <CaptionOverlay
          visible={ccOn && cueIdx >= 0 && cues[cueIdx]}
          cueHtml={cues[cueIdx]?.html}
        />

        <div
          className={`absolute inset-0 transition-opacity duration-300 ${controlsVisible || loadingActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <TopBar
            rating={m.rating}
            topGenre={topGenre}
            VolumeIcon={VolumeIcon}
            muted={muted}
            volume={volume}
            onBack={() => navigate(-1)}
            onToggleMute={() => {
              const v = videoRef.current
              if (!v) return
              v.muted = !v.muted
              setMuted(v.muted)
              showControls(true)
            }}
            onVolume={(val) => {
              setMuted(false)
              setVolume(val)
              showControls(true)
            }}
          />

          <CenterControls
            show={!isBuffering && !isLoading}
            paused={paused}
            onBack10={() => {
              const v = videoRef.current
              if (!v) return
              v.currentTime = Math.max(0, v.currentTime - 10)
              showControls(true)
            }}
            onPlayPause={() => {
              const v = videoRef.current
              if (!v) return
              v.paused ? v.play() : v.pause()
              showControls(true)
            }}
            onForward10={() => {
              const v = videoRef.current
              if (!v) return
              v.currentTime = Math.min(v.duration || v.currentTime + 10, v.currentTime + 10)
              showControls(true)
            }}
          />

          <BottomBar
            title={m.title}
            duration={duration}
            time={time}
            resumeAt={resumeAt}
            progress={progress}
            videoRef={videoRef}
            showControls={showControls}
            setTime={setTime}
            setProgress={setProgress}
            seekTo={seekTo}
          />

          <BottomRight
            showSubtitlesButton={cues.length > 0}
            ccOn={ccOn}
            onToggleCC={() => setCcOn((v) => !v)}
            onAudioClick={() => {}}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => {
              toggleFullscreen()
              showControls(true)
            }}
            showControls={showControls}
          />
        </div>
      </div>
    </main>
  )
}
