import { Loader2 } from 'lucide-react'

export default function LoadingOverlay({ active, isLoading }) {
  if (!active) return null
  return (
    <div className="absolute inset-0 grid place-items-center pointer-events-none">
      <div className="flex items-center gap-3 px-3 py-2 rounded-full bg-white/10 text-white">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">{isLoading ? 'Loading…' : 'Buffering…'}</span>
      </div>
    </div>
  )
}
