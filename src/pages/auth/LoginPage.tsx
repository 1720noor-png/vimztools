import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Seo from '../../components/ui/Seo'

export default function LoginPage() {
  const { login, loginAsDemo, isAuthenticated, loading } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const redirectUrl = searchParams.get('redirect')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  if (isAuthenticated) {
    const target = redirectUrl ? decodeURIComponent(redirectUrl) : '/tools'
    navigate(target, { replace: true })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError('')
    setFieldErrors({})

    const cleanEmail = email.trim()
    const newFieldErrors: Record<string, string[]> = {}

    if (!cleanEmail) {
      newFieldErrors.email = ['Email address is required.']
    }
    if (!password) {
      newFieldErrors.password = ['Password is required.']
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors)
      return
    }

    const res = await login(cleanEmail, password)
    if (res.success) {
      const target = redirectUrl ? decodeURIComponent(redirectUrl) : '/tools'
      navigate(target, { replace: true })
    } else {
      if (res.errors && Object.keys(res.errors).length > 0) {
        setFieldErrors(res.errors)
      } else {
        setGeneralError(res.message || 'Invalid credentials. Please verify your email and password.')
      }
    }
  }

  return (
    <>
      <Seo
        title="Sign In | vimz.ai"
        description="Sign in to your vimz.ai account to access saved tools, history, and preferences."
      />
      <div className="mx-auto flex min-h-[78vh] w-full max-w-md flex-col justify-center px-4 py-12">
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl dark:border-slate-800 dark:bg-[#111827]">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-primary-600 via-[#9D388A] to-indigo-600 px-6 py-8 text-white">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-xs">
              <ShieldCheck className="h-3.5 w-3.5" /> Client-Side Tools &amp; Cloud Account
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight">Sign In to vimz</h1>
            <p className="mt-1 text-xs text-white/80">
              Access your saved favorites, recent activity, and customized tools.
            </p>
          </div>

          <div className="p-6">
            {/* Friendly Redirect Notice */}
            {redirectUrl && (
              <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50/90 p-3 text-xs text-sky-800 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-300">
                Please sign in to access your requested tool workspace.
              </div>
            )}

            {/* General Error Banner */}
            {generalError && (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                <span>{generalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Email Address
                </label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (fieldErrors.email) {
                        setFieldErrors((prev) => ({ ...prev, email: [] }))
                      }
                    }}
                    placeholder="you@example.com"
                    className={`w-full rounded-xl border bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white ${
                      fieldErrors.email?.length
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 dark:border-rose-600 dark:focus:ring-rose-950'
                        : 'border-slate-300 focus:border-primary-500 focus:ring-primary-200 dark:border-slate-700'
                    }`}
                  />
                </div>
                {fieldErrors.email && fieldErrors.email.length > 0 && (
                  <p className="mt-1 text-xs font-medium text-rose-500">
                    {fieldErrors.email[0]}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-semibold text-primary-600 hover:underline dark:text-primary-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => ({ ...prev, password: [] }))
                      }
                    }}
                    placeholder="••••••••"
                    className={`w-full rounded-xl border bg-white py-2.5 pl-9 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white ${
                      fieldErrors.password?.length
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 dark:border-rose-600 dark:focus:ring-rose-950'
                        : 'border-slate-300 focus:border-primary-500 focus:ring-primary-200 dark:border-slate-700'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password && fieldErrors.password.length > 0 && (
                  <p className="mt-1 text-xs font-medium text-rose-500">
                    {fieldErrors.password[0]}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-md transition hover:from-primary-700 hover:to-indigo-700 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Signing In...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-semibold uppercase text-slate-400 dark:bg-[#111827]">
                Quick test drive
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                loginAsDemo()
                const target = redirectUrl ? decodeURIComponent(redirectUrl) : '/tools'
                navigate(target, { replace: true })
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary-300 bg-primary-50/50 py-2.5 text-xs font-bold text-primary-700 transition hover:bg-primary-100/60 dark:border-primary-800 dark:bg-primary-950/30 dark:text-primary-300"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary-500" /> 1-Click Demo Guest Mode
            </button>

            <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
              Don&apos;t have an account yet?{' '}
              <Link
                to={redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : '/register'}
                className="font-bold text-primary-600 hover:underline dark:text-primary-400"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
