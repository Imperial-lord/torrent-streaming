import Badge from './Badge.jsx'

export default function TopBar({
  rating,
  topGenre,
  VolumeIcon,
  muted,
  volume,
  onToggleMute,
  onVolume,
}) {
  return (
    <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-none select-none">
      <div className="flex items-center gap-4 text-white/90 text-sm pointer-events-auto">
        {rating && <Badge>{rating}</Badge>}
        {rating && topGenre && <div className="h-5 w-px bg-white/40" />}
        {topGenre && <div className="opacity-90">{topGenre}</div>}
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
