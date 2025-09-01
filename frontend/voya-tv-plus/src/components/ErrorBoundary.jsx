import React from 'react'

export default class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null } }
    static getDerivedStateFromError(error) { return { hasError: true, error } }
    componentDidCatch(err, info) { console.error('ErrorBoundary:', err, info) }

    render() {
        if (this.state.hasError) {
            return (
                <div className="mx-auto max-w-3xl p-6 mt-8 rounded-3xl bg-[var(--card)] ring-1 ring-ink-800">
                    <h2 className="font-display text-2xl mb-2">Something went wrong</h2>
                    <p className="text-ink-300 text-sm">{String(this.state.error?.message || 'Unknown error')}</p>
                    <button className="mt-4 px-4 py-2 rounded-full ring-1 ring-ink-600" onClick={() => location.reload()}>
                        Reload
                    </button>
                </div>
            )
        }
        return this.props.children
    }
}