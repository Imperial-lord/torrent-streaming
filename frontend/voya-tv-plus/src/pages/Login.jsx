import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'

export default function Login() {
  const nav = useNavigate()
  const loc = useLocation()
  const from = loc.state?.from?.pathname || '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(username.trim(), password)
      nav(from, { replace: true })
    } catch (err) {
      setError('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[var(--bg)] to-black opacity-80" />
      <div className="absolute -top-40 -left-40 w-[60rem] h-[60rem] rounded-full blur-3xl bg-ink-700/20" />
      <div className="absolute -bottom-40 -right-40 w-[60rem] h-[60rem] rounded-full blur-3xl bg-accent/10" />

      {/* content */}
      <div className="relative z-10 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="text-3xl font-display font-semibold tracking-tight">voya tv+</div>
            <div className="mt-2 text-ink-400 text-sm">Sign in to continue</div>
          </div>

          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl"
          >
            <label className="block mb-4">
              <span className="block text-sm text-ink-300 mb-1">Username</span>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-3 outline-none focus:ring-2 focus:ring-accent/60"
                placeholder="yourname"
              />
            </label>

            <label className="block mb-6">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-ink-300">Password</span>
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="text-xs text-ink-400 hover:text-ink-200"
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-3 outline-none focus:ring-2 focus:ring-accent/60"
                placeholder="••••••••"
              />
            </label>

            {error && <div className="mb-4 text-sm text-red-400">{error}</div>}

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full rounded-xl bg-white text-black py-3 font-medium hover:opacity-95 active:opacity-90 disabled:opacity-60 transition"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>

            <div className="mt-4 text-center text-xs text-ink-400">
              By signing in you agree to our{' '}
              <span className="underline hover:text-ink-200">Terms</span> &{' '}
              <span className="underline hover:text-ink-200">Privacy</span>.
            </div>
          </form>

          <div className="mt-8 text-center text-ink-400 text-xs">
            Tip: this is a private preview build for selected users.
          </div>
        </div>
      </div>
    </div>
  )
}
