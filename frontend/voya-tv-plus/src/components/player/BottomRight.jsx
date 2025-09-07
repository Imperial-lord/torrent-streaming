import { Captions, Languages, Maximize, Minimize } from 'lucide-react'
import Small from './Small.jsx'

export default function BottomRight({
  showSubtitlesButton,
  ccOn,
  onToggleCC,
  onAudioClick,
  isFullscreen,
  onToggleFullscreen,
  showControls,
}) {
  const FullscreenIcon = isFullscreen ? Minimize : Maximize

  return (
    <div className="absolute bottom-16 right-6 flex items-center gap-3 pointer-events-auto">
      {showSubtitlesButton && (
        <Small
          onClick={() => {
            onToggleCC()
            showControls?.(true)
          }}
          title="Subtitles"
        >
          <Captions className="w-5 h-5" />
          <span className="text-xs">{ccOn ? 'On' : 'Off'}</span>
        </Small>
      )}
      <Small
        onClick={() => {
          onAudioClick?.()
          showControls?.(true)
        }}
        title="Audio"
      >
        <Languages className="w-5 h-5" />
      </Small>
      <Small
        onClick={() => {
          onToggleFullscreen?.()
          showControls?.(true)
        }}
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      >
        <FullscreenIcon className="w-5 h-5" />
      </Small>
    </div>
  )
}
