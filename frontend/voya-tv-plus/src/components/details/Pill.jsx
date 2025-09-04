export default function Pill({ children, title }) {
    return (
        <span
            title={title}
            className="inline-flex items-center rounded-md bg-gray-900/8 px-2 py-1 text-xs text-gray-900 ring-1 ring-black/5 backdrop-blur-sm dark:bg-white/10 dark:text-white dark:ring-white/10"
        >
      {children}
    </span>
    )
}