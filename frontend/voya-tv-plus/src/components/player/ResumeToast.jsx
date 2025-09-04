export default function ResumeToast({ show, label }) {
  if (!show) return null
  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none">
      <div className="px-4 py-2 rounded-full bg-black/70 text-white text-sm">{label}</div>
    </div>
  )
}
