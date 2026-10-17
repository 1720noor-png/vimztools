import { useState, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from 'lucide-react'
import { authService } from '../../services/authService'
import PasswordRequirements, { checkPasswordComplexity } from '../../components/auth/PasswordRequirements'
import Seo from '../../components/ui/Seo'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const initialEmail = searchParams.get('email') || ''
  const initialToken = searchParams.get('token') || ''

  const [email, setEmail] = useState(initialEmail)
  const [token, setToken] = useState(initialToken)
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [generalError, setGeneralError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const { isValid: isPasswordValid } = useMemo(
    () => checkPasswordComplexity(password),
    [password],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError('')
    setFieldErrors({})

    const cleanEmail = email.trim()
    const newFieldErrors: Record<string, string[]> = {}

    if (!cleanEmail) {
      newFieldErrors.email = ['Email address is required.']
    }

    if (!isPasswordValid) {
      newFieldErrors.password = [
        'Password must satisfy all 5 complexity requirements.',
      ]
    }

    if (password !== passwordConfirmation) {
      newFieldErrors.password_confirmation = ['Passwords do not match.']
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors)
      return
    }

    setLoading(true)
    try {
      const res = await authService.resetPassword({
        email: cleanEmail,
        password,
        token: token.trim() || undefined,
      })
      setSuccessMsg(res.message || 'Password has been successfully updated.')
    } catch (err: any) {
      if (err?.errors) {
        setFieldErrors(err.errors)
      } else {
        setGeneralError(
          err?.message || 'Could not reset password. Please check your credentials.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Seo
        title="Set New Password | vimz.ai"
        description="Choose a new secure password for your vimz.ai account."
      />
      <div className="mx-auto flex min-h-[78vh] w-full max-w-md flex-col justify-center px-4 py-12">
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl dark:border-slate-800 dark:bg-[#111827]">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-primary-600 via-[#9D388A] to-indigo-600 px-6 py-8 text-white">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-xs">
              <ShieldCheck className="h-3.5 w-3.5" /> Enhanced Security
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight">Set New Password</h1>
            <p className="mt-1 text-xs text-white/80">
              Create a strong password complying with our security standards.
            </p>
          </div>

          <div className="p-6">
            {successMsg ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-center dark:border-emerald-900/40 dark:bg-emerald-950/30">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                  Password Updated!
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {successMsg}
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-md transition hover:from-primary-700 hover:to-indigo-700"
                >
                  Proceed to Sign In <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                {generalError && (
                  <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                    <span>{generalError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Account Email
                    </label>
                    <div className="relative mt-1.5">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
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

                  {/* Token (Optional / Auto-filled) */}
                  {initialToken ? null : (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        Reset Code / Token <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <div className="relative mt-1.5">
                        <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={token}
                          onChange={(e) => setToken(e.target.value)}
                          placeholder="Paste token or code if received"
                          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      New Password
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

                    {/* Real-time strict password complexity checklist */}
                    <PasswordRequirements password={password} />
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Confirm New Password
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
                        placeholder="Repeat new password"
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
                    disabled={loading || !isPasswordValid}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-md transition hover:from-primary-700 hover:to-indigo-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Updating Password...
                      </>
                    ) : (
                      <>
                        Update Password <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
                  Remember your password?{' '}
                  <Link
                    to="/login"
                    className="font-bold text-primary-600 hover:underline dark:text-primary-400"
                  >
                    Sign In
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
