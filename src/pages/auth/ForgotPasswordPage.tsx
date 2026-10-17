import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, CheckCircle2, ArrowRight, AlertCircle, Loader2, KeyRound } from 'lucide-react'
import { authService } from '../../services/authService'
import Seo from '../../components/ui/Seo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    const cleanEmail = email.trim()
    if (!cleanEmail) {
      setErrorMsg('Please enter your email address.')
      return
    }
    setLoading(true)
    try {
      await authService.forgotPassword(cleanEmail)
      setSent(true)
    } catch (err: any) {
      setErrorMsg(
        err?.message || 'Could not send reset link. Please verify your email.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Seo
        title="Forgot Password | vimz.ai"
        description="Reset your password for vimz.ai."
      />
      <div className="mx-auto flex min-h-[78vh] w-full max-w-md flex-col justify-center px-4 py-12">
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl dark:border-slate-800 dark:bg-[#111827]">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-primary-600 via-[#9D388A] to-indigo-600 px-6 py-8 text-white">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-xs">
              <KeyRound className="h-3.5 w-3.5" /> Account Security
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight">Recover Password</h1>
            <p className="mt-1 text-xs text-white/80">
              Enter your account email to receive your password reset authorization.
            </p>
          </div>

          <div className="p-6">
            {sent ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-center dark:border-emerald-900/40 dark:bg-emerald-950/30">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                  Reset Instructions Sent!
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
                  Password reset verification has been issued for <strong>{email}</strong>.
                </p>
                <div className="mt-5 space-y-2">
                  <Link
                    to={`/reset-password?email=${encodeURIComponent(email)}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-md transition hover:from-primary-700 hover:to-indigo-700"
                  >
                    Set New Password Now <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/login"
                    className="block text-center text-xs font-semibold text-slate-500 hover:underline dark:text-slate-400"
                  >
                    Return to Sign In
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                    <span>{errorMsg}</span>
                  </div>
                )}
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
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-md transition hover:from-primary-700 hover:to-indigo-700 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Instructions <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
                  Remember your password?{' '}
                  <Link
                    to="/login"
                    className="font-bold text-primary-600 hover:underline dark:text-primary-400"
                  >
                    Sign In
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
