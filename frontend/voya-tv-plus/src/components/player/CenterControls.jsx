import { Play, Pause, RotateCcw, RotateCw } from 'lucide-react'
import Ctl from './Ctl.jsx'

export default function CenterControls({ show, paused, onBack10, onPlayPause, onForward10 }) {
  if (!show) return null
  return (
    <div className="absolute inset-0 grid place-items-center pointer-events-none">
      <div className="flex items-center gap-10 pointer-events-auto">
        <Ctl onClick={onBack10} aria="Back 10">
          <RotateCcw className="w-6 h-6" />
          <span className="absolute bottom-5.5 text-[6px]">10</span>
        </Ctl>

        <Ctl onClick={onPlayPause} aria={paused ? 'Play' : 'Pause'} big>
          {paused ? <Play className="w-12 h-12" /> : <Pause className="w-12 h-12" />}
        </Ctl>

        <Ctl onClick={onForward10} aria="Forward 10">
          <RotateCw className="w-6 h-6" />
          <span className="absolute bottom-5.5 text-[6px]">10</span>
        </Ctl>
      </div>
    </div>
  )
}
