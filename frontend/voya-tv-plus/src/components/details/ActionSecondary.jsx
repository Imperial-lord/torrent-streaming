export default function ActionSecondary({ children, icon: Icon, onClick }) {
    return (
        <button
            onClick={onClick}
            className={[
                'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg transition',
                'ring-1 ring-gray-900/15 text-gray-900 hover:bg-gray-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900',
                'active:scale-[0.99]',
                // dark
                'dark:ring-white/20 dark:text-white dark:hover:bg-white/10 dark:focus-visible:ring-white dark:focus-visible:ring-offset-gray-900/0',
            ].join(' ')}
        >
            {Icon && <Icon className="h-5 w-5" />}
            {children}
        </button>
    )
}