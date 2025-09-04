export default function Small({ children, onClick, title }) {
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
