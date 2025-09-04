import SeekBar from './SeekBar.jsx'
import { fmt } from '../../utils/time.js'

export default function BottomBar({
  title,
  duration,
  time,
  resumeAt,
  progress,
  videoRef,
  showControls,
  setTime,
  setProgress,
  seekTo,
}) {
  return (
    <div className="absolute left-6 right-6 bottom-6 text-white select-none pointer-events-none">
      <div className="text-lg font-medium mb-2">{title}</div>

      <SeekBar
        duration={duration}
        time={time}
        progress={progress}
        videoRef={videoRef}
        showControls={showControls}
        setTime={setTime}
        setProgress={setProgress}
        seekTo={seekTo}
      />

      <div className="flex items-center justify-between text-[11px] text-white/70">
        <span>{fmt(time || resumeAt || 0)}</span>
        <span>-{fmt(isFinite(duration) && duration > 0 ? duration - (time || 0) : NaN)}</span>
      </div>
    </div>
  )
}
