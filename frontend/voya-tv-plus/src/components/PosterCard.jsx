export default function PosterCard({ item, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative w-[180px] shrink-0 focus:outline-none focus:ring-2 focus:ring-accent/60 rounded-xl2"
      title={item.title}
    >
      <div className="relative">
        <img
          src={item.poster || item.backdrop}
          alt={item.title}
          className="h-[270px] w-[180px] rounded-xl2 object-cover ring-1 ring-ink-800 group-hover:ring-ink-500 transition"
          loading="lazy"
          srcSet={(item.poster || '').replace('/original/', '/w300/') + ' 300w'}
        />
      </div>
      <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-500 group-hover:dark:text-gray-100 line-clamp-1">{item.title}</div>
      <div className="text-xs text-ink-400">{item.year}</div>
    </button>
  )
}