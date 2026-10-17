import { useState, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { checkPasswordComplexity } from '../../components/auth/PasswordRequirements'
import Seo from '../../components/ui/Seo'

export default function RegisterPage() {
  const { register, isAuthenticated, loading } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const redirectUrl = searchParams.get('redirect')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const { isValid: isPasswordValid } = useMemo(
    () => checkPasswordComplexity(password),
    [password],
  )

  if (isAuthenticated) {
    const target = redirectUrl ? decodeURIComponent(redirectUrl) : '/tools'
    navigate(target, { replace: true })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError('')
    setFieldErrors({})

    const cleanName = name.trim()
    const cleanEmail = email.trim()
    const newFieldErrors: Record<string, string[]> = {}

    if (!cleanName) {
      newFieldErrors.name = ['Full name is required.']
    }
    if (!cleanEmail) {
      newFieldErrors.email = ['Email address is required.']
    }
    if (!password) {
      newFieldErrors.password = ['Password is required.']
    } else if (!isPasswordValid) {
      newFieldErrors.password = [
        'Password must satisfy all 5 complexity requirements.',
      ]
    }
    if (password && passwordConfirmation && password !== passwordConfirmation) {
      newFieldErrors.password_confirmation = ['Passwords do not match.']
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors)
      return
    }

    const res = await register(cleanName, cleanEmail, password)
    if (res.success) {
      const target = redirectUrl ? decodeURIComponent(redirectUrl) : '/tools'
      navigate(target, { replace: true })
    } else {
      if (res.errors && Object.keys(res.errors).length > 0) {
        setFieldErrors(res.errors)
      } else {
        setGeneralError(
          res.message || 'Registration failed. Please check your details and try again.',
        )
      }
    }
  }

  return (
    <>
      <Seo
        title="Get Started | vimz.ai"
        description="Create your free vimz.ai account to access 2,000+ client-side tools and workspaces."
      />
      <div className="mx-auto flex min-h-[78vh] w-full max-w-md flex-col justify-center px-4 py-12">
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl dark:border-slate-800 dark:bg-[#111827]">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-primary-600 via-[#9D388A] to-indigo-600 px-6 py-8 text-white">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-xs">
              <ShieldCheck className="h-3.5 w-3.5" /> 100% Client-Side Privacy
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight">Create Your Account</h1>
            <p className="mt-1 text-xs text-white/80">
              Get instant, unrestricted access to all tools, templates, and workspaces.
            </p>
          </div>

          <div className="p-6">
            {/* Friendly Redirect Notice */}
            {redirectUrl && (
              <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50/90 p-3 text-xs text-sky-800 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-300">
                Please create an account or sign in to access your requested tool workspace.
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
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Full Name
                </label>
                <div className="relative mt-1.5">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (fieldErrors.name) {
                        setFieldErrors((prev) => ({ ...prev, name: [] }))
                      }
                    }}
                    placeholder="Jane Doe"
                    className={`w-full rounded-xl border bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white ${
                      fieldErrors.name?.length
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 dark:border-rose-600 dark:focus:ring-rose-950'
                        : 'border-slate-300 focus:border-primary-500 focus:ring-primary-200 dark:border-slate-700'
                    }`}
                  />
                </div>
                {fieldErrors.name && fieldErrors.name.length > 0 && (
                  <p className="mt-1 text-xs font-medium text-rose-500">
                    {fieldErrors.name[0]}
                  </p>
                )}
              </div>

              {/* Email Address */}
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

              {/* Password with Strict Real-time Complexity */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Password
                </label>
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

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Confirm Password
                </label>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordConfirmation}
                    onChange={(e) => {
                      setPasswordConfirmation(e.target.value)
                      if (fieldErrors.password_confirmation) {
                        setFieldErrors((prev) => ({ ...prev, password_confirmation: [] }))
                      }
                    }}
                    placeholder="Repeat your password"
                    className={`w-full rounded-xl border bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-white ${
                      fieldErrors.password_confirmation?.length
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200 dark:border-rose-600 dark:focus:ring-rose-950'
                        : 'border-slate-300 focus:border-primary-500 focus:ring-primary-200 dark:border-slate-700'
                    }`}
                  />
                </div>
                {fieldErrors.password_confirmation && fieldErrors.password_confirmation.length > 0 && (
                  <p className="mt-1 text-xs font-medium text-rose-500">
                    {fieldErrors.password_confirmation[0]}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 via-[#9D388A] to-indigo-600 py-3 text-sm font-bold text-white shadow-md shadow-primary-500/25 transition hover:brightness-105 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Creating Account...
                  </>
                ) : (
                  <>
                    Get Started Free <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link
                to={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login'}
                className="font-bold text-primary-600 hover:underline dark:text-primary-400"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
