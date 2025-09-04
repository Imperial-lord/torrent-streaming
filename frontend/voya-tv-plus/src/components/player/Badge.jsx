export default function Badge({ children }) {
  return (
    <span className="px-2 py-1 rounded-md bg-white/10 border border-white/20 text-white/90">
      {children}
    </span>
  )
}
