import { useState, useEffect } from 'react'
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { apiForgotPassword } from '../../lib/authApi'
import { useToast } from '../ui/Toast'

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalView,
    closeAuthModal,
    openAuthModal,
    login,
    register,
    loginAsDemo,
    isLoading,
  } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isAuthModalOpen) {
      setErrorMsg('')
      setForgotSent(false)
      const onEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeAuthModal()
      }
      window.addEventListener('keydown', onEsc)
      return () => window.removeEventListener('keydown', onEsc)
    }
  }, [isAuthModalOpen, closeAuthModal])

  if (!isAuthModalOpen) return null

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.')
      return
    }
    const res = await login(email.trim(), password)
    if (!res.success) {
      setErrorMsg(res.message || 'Invalid credentials. Please try again.')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.')
      return
    }
    if (!email.trim() || !password) {
      setErrorMsg('Please provide a valid email and password.')
      return
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.')
      return
    }
    const res = await register(name.trim(), email.trim(), password)
    if (!res.success) {
      setErrorMsg(res.message || 'Registration failed. Please try again.')
    }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (!email.trim()) {
      setErrorMsg('Please enter your account email address.')
      return
    }
    setForgotLoading(true)
    try {
      const res = await apiForgotPassword(email.trim())
      if (res.status === 'success') {
        setForgotSent(true)
        toast('Password reset instructions sent to your email!', 'success')
      } else {
        setErrorMsg(res.message || 'Could not find account with that email.')
      }
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={closeAuthModal}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl transition-all dark:border-slate-800 dark:bg-[#111827]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient banner */}
        <div className="relative bg-gradient-to-r from-primary-600 via-[#9D388A] to-indigo-600 px-6 py-7 text-white">
          <button
            onClick={closeAuthModal}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-1.5 text-white/80 transition-all hover:bg-white/20 hover:text-white"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-xs">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure Authentication
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            {authModalView === 'forgot'
              ? 'Reset Password'
              : authModalView === 'register'
                ? 'Create Your Account'
                : 'Welcome Back to vimz'}
          </h2>
          <p className="mt-1 text-xs text-white/80">
            {authModalView === 'forgot'
              ? 'Enter your email to receive recovery instructions.'
              : authModalView === 'register'
                ? 'Save favorite tools, access history, and sync across devices.'
                : 'Sign in to access your saved tools and custom preferences.'}
          </p>
        </div>

        {/* View Switcher Tabs (Only if not in forgot mode) */}
        {authModalView !== 'forgot' && (
          <div className="flex border-b border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/50">
            <button
              onClick={() => {
                setErrorMsg('')
                openAuthModal('login')
              }}
              className={`flex-1 py-3 text-center text-xs font-bold transition-all ${
                authModalView === 'login'
                  ? 'border-b-2 border-primary-600 bg-white text-primary-700 dark:border-primary-400 dark:bg-[#111827] dark:text-primary-300'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setErrorMsg('')
                openAuthModal('register')
              }}
              className={`flex-1 py-3 text-center text-xs font-bold transition-all ${
                authModalView === 'register'
                  ? 'border-b-2 border-primary-600 bg-white text-primary-700 dark:border-primary-400 dark:bg-[#111827] dark:text-primary-300'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          {authModalView === 'forgot' ? (
            <div>
              {forgotSent ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-center dark:border-emerald-900/40 dark:bg-emerald-950/30">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                    Instructions Sent!
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    If an account exists for <strong>{email}</strong>, you will receive password
                    reset instructions shortly.
                  </p>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:underline dark:text-primary-400"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgot} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Email Address
                    </label>
                    <div className="relative mt-1.5">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-primary-950/40"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full rounded-xl bg-primary-600 py-3 text-sm font-bold text-white shadow-md shadow-primary-600/25 transition-all hover:bg-primary-700 disabled:opacity-50"
                  >
                    {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => openAuthModal('login')}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : authModalView === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Email Address
                </label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-primary-950/40"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => openAuthModal('forgot')}
                    className="text-[11px] font-semibold text-primary-600 hover:underline dark:text-primary-400"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-primary-950/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-primary-600 py-3 text-sm font-bold text-white shadow-md shadow-primary-600/25 transition-all hover:bg-primary-700 disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <span className="relative bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:bg-[#111827]">
                  Or try instantly
                </span>
              </div>

              <button
                type="button"
                onClick={loginAsDemo}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-300 bg-sky-50 py-2.5 text-xs font-bold text-sky-800 transition-all hover:bg-sky-100 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300"
              >
                <Sparkles className="h-3.5 w-3.5 text-sky-500" />
                Continue with 1-Click Demo Account
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Full Name
                </label>
                <div className="relative mt-1.5">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-primary-950/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Email Address
                </label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-primary-950/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Password (min 6 chars)
                </label>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-primary-950/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white shadow-md shadow-primary-600/25 transition-all hover:bg-primary-700 disabled:opacity-50"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
