import { ArrowLeft } from 'lucide-react'
import Badge from './Badge.jsx'

export default function TopBar({
  rating,
  topGenre,
  VolumeIcon,
  muted,
  volume,
  onToggleMute,
  onVolume,
  onBack, // New prop for back navigation
}) {
  return (
    <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-none select-none">
      <div className="flex items-center gap-6 text-white/90 text-sm pointer-events-auto">
        {/* Back button with subtle styling */}
        <button
          className="p-2 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-all"
          onClick={onBack}
          aria-label="Go back"
          title="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Movie info with cleaner spacing */}
        {(rating || topGenre) && (
          <div className="flex items-center gap-3">
            {rating && <Badge>{rating}</Badge>}
            {rating && topGenre && <span className="text-white/40">•</span>}
            {topGenre && <div className="opacity-90">{topGenre}</div>}
          </div>
        )}
      </div>

      <div className="pointer-events-auto flex items-center gap-3">
        <button
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          onClick={onToggleMute}
          aria-label="Mute"
          title="Mute"
        >
          <VolumeIcon className="w-5 h-5" />
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={muted ? 0 : volume}
          onChange={(e) => onVolume(parseFloat(e.target.value))}
          className="w-44 accent-white/90"
          aria-label="Volume"
        />
      </div>
    </div>
  )
}
