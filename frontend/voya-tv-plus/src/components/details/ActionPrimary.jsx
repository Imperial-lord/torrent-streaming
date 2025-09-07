export default function ActionPrimary({ children, icon: Icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-medium transition shadow-sm',
        'bg-gray-900 text-white hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900',
        'active:scale-[0.99]',
        // dark inversion
        'dark:bg-white dark:text-gray-900 dark:hover:bg-white/90 dark:focus-visible:ring-white dark:focus-visible:ring-offset-gray-900/0',
      ].join(' ')}
    >
      {Icon && <Icon className="h-5 w-5" />}
      {children}
    </button>
  )
}
