import { Routes, Route, NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import WatchNow from './pages/WatchNow.jsx'
import TVPlus from './pages/TVPlus.jsx'
import Search from './pages/Search.jsx'
import Details from './pages/Details.jsx'
import Player from './pages/Player.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

import { hasSession, logout } from './api/auth'
import Login from './pages/Login.jsx'

export default function App() {
  const [dark, setDark] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  )
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <div className="min-h-screen font-sans bg-[var(--bg)] text-[var(--ink)]">
      <TopNav dark={dark} onToggle={() => setDark(d => !d)} />
      <ErrorBoundary>
        <Routes>
          {/* public route */}
          <Route path="/login" element={<Login />} />

          {/* protected routes */}
          <Route
            path="/"
            element={<RequireAuth><WatchNow /></RequireAuth>}
          />
          <Route
            path="/tvplus"
            element={<RequireAuth><TVPlus /></RequireAuth>}
          />
          <Route
            path="/search"
            element={<RequireAuth><Search /></RequireAuth>}
          />
          <Route
            path="/title/:id"
            element={<RequireAuth><Details /></RequireAuth>}
          />
          <Route
            path="/play/:id"
            element={<RequireAuth><Player /></RequireAuth>}
          />

          {/* catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </div>
  )
}

function RequireAuth({ children }) {
  const location = useLocation()
  if (!hasSession()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

function TopNav({ dark, onToggle }) {
  const nav = useNavigate()
  const signedIn = hasSession()
  return (
    <header className="sticky top-0 z-50 bg-[var(--bg)]/80 backdrop-blur-md">
      {signedIn && <nav className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <div className="text-xl font-display font-semibold">voya tv+</div>
        <div className="flex gap-6 text-sm">
          <Tab to="/">Watch Now</Tab>
          <Tab to="/tvplus">Live TV+</Tab>
          <Tab to="/search">Search</Tab>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            className="px-3 py-1 rounded-full border border-ink-700 text-xs"
            aria-label="Toggle theme"
          >
            {dark ? 'Light' : 'Dark'}
          </button>
          {!signedIn ? (
            <button
              onClick={() => nav('/login')}
              className="px-3 py-1 rounded-full border border-ink-700 text-xs hover:bg-ink-800/30"
            >
              Sign In
            </button>
          ) : (
            <button
              onClick={() => { logout(); nav('/login', { replace: true }) }}
              className="px-3 py-1 rounded-full border border-ink-700 text-xs hover:bg-ink-800/30"
            >
              Sign Out
            </button>
          )}
        </div>
      </nav>}
    </header>
  )
}

function Tab({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `pb-1 ${isActive ? 'text-accent border-b-2 border-accent' : 'text-ink-300 hover:text-ink-100'}`
      }
      end
    >
      {children}
    </NavLink>
  )
}