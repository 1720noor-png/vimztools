import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User,
  Star,
  Clock,
  Settings,
  LogOut,
  Mail,
  Shield,
  ArrowRight,
  BookmarkCheck,
  CheckCircle2,
  Trash2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getToolById } from '../../lib/catalog'
import Seo from '../../components/ui/Seo'

export default function ProfilePage() {
  const { user, isAuthenticated, logout, updateProfile, toggleFavorite, isLoading } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'favorites' | 'history' | 'settings'>('favorites')

  // Settings form state
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const [feedbackMsg, setFeedbackMsg] = useState('')

  const favoriteTools = useMemo(() => {
    if (!user?.favoriteToolIds) return []
    return user.favoriteToolIds
      .map((id) => getToolById(id))
      .filter((t): t is NonNullable<typeof t> => !!t)
  }, [user?.favoriteToolIds])

  const recentTools = useMemo(() => {
    if (!user?.recentToolIds) return []
    return user.recentToolIds
      .map((id) => getToolById(id))
      .filter((t): t is NonNullable<typeof t> => !!t)
  }, [user?.recentToolIds])

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-md dark:border-slate-800 dark:bg-slate-900">
          <User className="h-8 w-8 text-primary-600" />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Sign In to Access Your Profile
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Create an account or sign in to save favorite tools, access history, and manage preferences.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            to="/login"
            className="rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary-700"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Create Account
          </Link>
        </div>
      </div>
    )
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedbackMsg('')
    const res = await updateProfile({
      name: name.trim(),
      email: email.trim(),
      password: password ? password : undefined,
    })
    if (res.success) {
      setFeedbackMsg('Profile updated successfully!')
      setPassword('')
    }
  }

  return (
    <>
      <Seo
        title={`${user.name} - Profile & Saved Tools | vimz.ai`}
        description="View your saved favorite tools, recent history, and account settings on vimz.ai."
      />

      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* User Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-indigo-200/90 bg-[linear-gradient(135deg,rgba(238,242,255,0.85)_0%,rgba(255,255,255,0.95)_100%)] p-6 shadow-sm sm:p-8 dark:border-indigo-900/40 dark:bg-[linear-gradient(135deg,#1e1b4b_0%,#111827_100%)]">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-xl font-extrabold text-white shadow-md shadow-primary-600/20 sm:h-20 sm:w-20 sm:text-2xl">
                {initials || 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                    {user.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <Shield className="h-3 w-3" /> Active
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
                  <Mail className="h-3.5 w-3.5" /> {user.email}
                </p>
                {user.created_at && (
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Member since {new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                logout()
                navigate('/')
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/70 px-4 py-2 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-indigo-100/70 pt-5 sm:grid-cols-3 dark:border-indigo-900/30">
            <div className="rounded-2xl border border-indigo-200/60 bg-white/80 p-3.5 shadow-2xs dark:border-indigo-900/40 dark:bg-slate-900/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Favorite Tools
              </span>
              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                {favoriteTools.length}
              </p>
            </div>
            <div className="rounded-2xl border border-indigo-200/60 bg-white/80 p-3.5 shadow-2xs dark:border-indigo-900/40 dark:bg-slate-900/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Recent History
              </span>
              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                {recentTools.length}
              </p>
            </div>
            <div className="col-span-2 rounded-2xl border border-indigo-200/60 bg-white/80 p-3.5 shadow-2xs sm:col-span-1 dark:border-indigo-900/40 dark:bg-slate-900/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Storage Backend
              </span>
              <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Laravel + MySQL Database
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="mt-8 flex gap-2 border-b border-slate-200/80 pb-2 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'favorites'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <Star className="h-3.5 w-3.5" /> Favorite Tools ({favoriteTools.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="h-3.5 w-3.5" /> Recent History
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <Settings className="h-3.5 w-3.5" /> Account Settings
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'favorites' && (
            <div>
              {favoriteTools.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
                  <BookmarkCheck className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
                  <h3 className="mt-3 text-base font-bold text-slate-800 dark:text-slate-200">
                    No favorites saved yet
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Click the star icon on any tool workspace to save it to your personal favorites!
                  </p>
                  <Link
                    to="/tools"
                    className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-700"
                  >
                    Browse All Tools <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {favoriteTools.map((t) => (
                    <div
                      key={t.id}
                      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-[#111827]"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-bold text-primary-700 dark:bg-primary-950/60 dark:text-primary-300">
                            {t.category}
                          </span>
                          <button
                            onClick={() => toggleFavorite(t.id)}
                            title="Remove from favorites"
                            className="rounded-lg p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <h4 className="mt-3 font-bold text-slate-900 dark:text-white">{t.name}</h4>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                          {t.description}
                        </p>
                      </div>
                      <Link
                        to={t.path}
                        className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary-600 group-hover:gap-1.5 dark:text-primary-400"
                      >
                        Open Workspace <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              {recentTools.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
                  <Clock className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
                  <h3 className="mt-3 text-base font-bold text-slate-800 dark:text-slate-200">
                    No recent activity yet
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Tools you use will automatically appear here for quick access.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recentTools.map((t) => (
                    <Link
                      key={t.id}
                      to={t.path}
                      className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-[#111827]"
                    >
                      <div>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {t.category}
                        </span>
                        <h4 className="mt-3 font-bold text-slate-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
                          {t.name}
                        </h4>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                          {t.description}
                        </p>
                      </div>
                      <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary-600 group-hover:gap-1.5 dark:text-primary-400">
                        Launch Tool <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-xl rounded-3xl border border-slate-200/90 bg-white p-6 dark:border-slate-800 dark:bg-[#111827]">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Profile Details</h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Updates are saved to your account in the MySQL database.
              </p>

              {feedbackMsg && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" /> {feedbackMsg}
                </div>
              )}

              <form onSubmit={handleUpdate} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    New Password (Optional)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-xl bg-primary-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
