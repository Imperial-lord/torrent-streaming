import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Play, Sparkles } from 'lucide-react'
import { login } from '../api/auth'

// Curated high-quality background images
const backgroundImages = [
  'https://images.unsplash.com/photo-1666698907755-672d406ea71d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2940&q=80',
  'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2940&q=80',
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2925&q=80',
  'https://images.unsplash.com/photo-1514899706957-d22ee867a77b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80',
  'https://images.unsplash.com/photo-1616530940355-351fabd9524b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2940&q=80',
]

export default function Login() {
  const nav = useNavigate()
  const loc = useLocation()
  const from = loc.state?.from?.pathname || '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentBg, setCurrentBg] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  // Rotate background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgroundImages.length)
    }, 5000) // Change every 5 seconds
    return () => clearInterval(interval)
  }, [])

  // Animation on mount
  useEffect(() => {
    setIsVisible(true)
  }, [])

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
      {/* Dynamic Background with smooth transitions */}
      <div className="absolute inset-0">
        {backgroundImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
              index === currentBg ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}

        {/* Overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
      </div>

      {/* Animated floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-white/20 rounded-full animate-pulse" />
        <div className="absolute top-40 right-32 w-1 h-1 bg-accent/40 rounded-full animate-ping" />
        <div
          className="absolute bottom-32 left-16 w-3 h-3 bg-white/10 rounded-full animate-bounce"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute top-60 right-20 w-1.5 h-1.5 bg-accent/30 rounded-full animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-16">
        <div
          className={`w-full max-w-md transform transition-all duration-1000 ease-out ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-white to-white/80 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Play className="w-6 h-6 text-black ml-0.5" fill="currentColor" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div className="text-4xl font-display font-bold tracking-tight bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                voya tv+
              </div>
            </div>
            <div className="text-white/70 text-lg font-medium">Welcome back</div>
            <div className="text-white/50 text-sm mt-1">Sign in to continue your journey</div>
          </div>

          {/* Login Form */}
          <form onSubmit={onSubmit} className="group">
            <div className="backdrop-blur-2xl bg-white/[0.05] border border-white/10 rounded-3xl p-8 shadow-2xl hover:bg-white/[0.08] transition-all duration-500">
              {/* Username Field */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white/80 mb-3">Username</label>
                <div className="relative">
                  <input
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-4 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/30 focus:border-white/20 transition-all duration-300 hover:bg-black/30"
                    placeholder="Enter your username"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300" />
                </div>
              </div>

              {/* Password Field */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-white/80">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="flex items-center gap-2 text-sm text-white/60 hover:text-white/90 transition-colors duration-200"
                  >
                    {showPw ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Show
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-4 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/30 focus:border-white/20 transition-all duration-300 hover:bg-black/30"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading || !username || !password}
                className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-white to-white/95 text-black py-4 px-6 font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 transition-all duration-300 group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <div className="relative flex items-center justify-center gap-3">
                  {loading && (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  )}
                  {loading ? 'Signing in...' : 'Sign In'}
                </div>
              </button>

              {/* Terms */}
              <div className="mt-6 text-center text-xs text-white/50 leading-relaxed">
                By signing in you agree to our{' '}
                <button
                  onClick={(e) => e.preventDefault()}
                  className="text-white/70 hover:text-white underline underline-offset-2 transition-colors duration-200"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  onClick={(e) => e.preventDefault()}
                  className="text-white/70 hover:text-white underline underline-offset-2 transition-colors duration-200"
                >
                  Privacy Policy
                </button>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/60 text-sm">Private preview for selected users</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
