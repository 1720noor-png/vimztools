import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Search,
  CornerDownLeft,
  X,
  ArrowRight,
  Sun,
  Moon,
  ChevronDown,
  FileText,
  Sparkles,
  Terminal,
  ShieldAlert,
  Leaf,
  TrendingUp,
  Building2,
  Images,
  GraduationCap,
  HeartPulse,
  Home as HomeIcon,
  Megaphone,
  User,
  Star,
  LogOut,
} from 'lucide-react'
import Logo from '../ui/Logo'
import { categories } from '../../lib/catalog'
import { useToolRegistry } from '../../lib/toolRegistry'
import { useTheme } from './ThemeProvider'
import { useAuth } from '../../context/AuthContext'

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const { tools: registryTools } = useToolRegistry()

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return registryTools.filter((t) =>
      [t.name, t.category, t.description, ...t.keywords].join(' ').toLowerCase().includes(q),
    )
  }, [query, registryTools])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${selected}"]`,
    )
    el?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  useEffect(() => {
    setSelected(0)
  }, [query])

  if (!open) return null

  const go = (path: string) => {
    onClose()
    navigate(path)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => Math.min(s + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => Math.max(s - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selected]) go(results[selected].path)
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 px-4 pt-24 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="animate-modal-in w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/20 dark:bg-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 dark:border-slate-700">
          <Search className="h-5 w-5 shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search tools..."
            className="w-full bg-transparent py-4 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-100"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {query.trim() === '' ? (
          <div className="max-h-96 overflow-y-auto p-3">
            <p className="px-2 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Browse by category
            </p>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => go('/tools')}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-primary-50"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-medium text-slate-700">No tools found</p>
            <p className="mt-1 text-sm text-slate-400">
              Try searching for &quot;PDF&quot;, &quot;QR&quot;, &quot;resume&quot;...
            </p>
          </div>
        ) : (
          <div ref={listRef} className="max-h-96 overflow-y-auto p-2">
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </p>
            {results.map((tool, i) => (
              <button
                data-index={i}
                key={tool.id}
                onClick={() => go(tool.path)}
                onMouseEnter={() => setSelected(i)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                  selected === i ? 'bg-primary-50' : ''
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                  <ArrowRight className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{tool.name}</p>
                  <p className="truncate text-xs text-slate-400">{tool.category}</p>
                </div>
                <CornerDownLeft className="h-4 w-4 shrink-0 text-slate-300" />
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3" /> to open
          </span>
          <span>
            <kbd className="rounded border border-slate-300 bg-white px-1">↑</kbd>{' '}
            <kbd className="rounded border border-slate-300 bg-white px-1">↓</kbd> to navigate
          </span>
          <span>
            <kbd className="rounded border border-slate-300 bg-white px-1">esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  )
}

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const categoryLinks = [
    { label: 'MS Word Suite', to: '/tools/document-word', icon: FileText },
    { label: 'PDF Utilities', to: '/tools/pdf', icon: FileText },
    { label: 'AI & Machine Learning', to: '/ai-tools', icon: Sparkles },
    { label: 'Developer & Cloud', to: '/dev-cloud', icon: Terminal },
    { label: 'Cybersecurity', to: '/cyber-security', icon: ShieldAlert },
    { label: 'Clean Energy', to: '/green-energy', icon: Leaf },
    { label: 'Fintech & Venture', to: '/fintech-venture', icon: TrendingUp },
    { label: 'Everyday Tools', to: '/civic-lifestyle', icon: Sparkles },
    { label: 'Office & Corporate', to: '/office-corporate', icon: Building2 },
    { label: 'Image Tools', to: '/image-tools', icon: Images },
    { label: 'Students & Academics', to: '/students-academics', icon: GraduationCap },
    { label: 'Health Portal', to: '/health', icon: HeartPulse },
    { label: 'Household Portal', to: '/household', icon: HomeIcon },
    { label: 'Marketers & SEO', to: '/marketers-seo', icon: Megaphone },
  ]

  const isLinkActive = (to: string) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  const isAnyCategoryActive = categoryLinks.some((c) => isLinkActive(c.to))

  const ThemeButton = (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-slate-50 text-slate-500 transition-colors duration-300 hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
    >
      {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  )

  const isHome = location.pathname === '/'
  const [scrolledPastHero, setScrolledPastHero] = useState(!isHome)

  useEffect(() => {
    if (!isHome) {
      setScrolledPastHero(true)
      return
    }

    const handleScroll = () => {
      const isPast = window.scrollY > 240
      setScrolledPastHero(isPast)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHome])

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md shadow-2xs dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="group flex shrink-0 items-center transition-opacity duration-200 hover:opacity-85"
          aria-label="vimz.ai home"
        >
          <Logo className="h-8 w-auto sm:h-9" />
        </button>

        {/* Decluttered Desktop Nav: 4 essential items (Home, Categories Dropdown, All Tools, Guides) */}
        <nav className="mx-auto hidden items-center gap-2 md:flex">
          <button
            onClick={() => navigate('/')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
              location.pathname === '/'
                ? 'bg-primary-50 text-primary-700 shadow-2xs ring-1 ring-primary-200/50 dark:bg-slate-800 dark:text-brand dark:ring-slate-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white'
            }`}
          >
            Home
          </button>

          {/* Categories Dropdown Container */}
          <div
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                isAnyCategoryActive
                  ? 'bg-primary-50 text-primary-700 shadow-2xs ring-1 ring-primary-200/50 dark:bg-slate-800 dark:text-brand dark:ring-slate-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white'
              }`}
              aria-expanded={dropdownOpen}
            >
              Categories
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            <div
              className={`absolute left-1/2 top-full z-50 mt-1.5 w-[560px] -translate-x-1/2 rounded-2xl border border-slate-200/90 bg-white/95 p-3 shadow-2xl backdrop-blur-xl transition-all duration-200 dark:border-slate-800 dark:bg-[#111827]/95 ${
                dropdownOpen
                  ? 'visible translate-y-0 opacity-100 pointer-events-auto'
                  : 'invisible -translate-y-1 opacity-0 pointer-events-none'
              }`}
            >
              <div className="mb-2 px-2.5 pt-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                All Tool Categories
              </div>
              <div className="grid grid-cols-2 gap-1">
                {categoryLinks.map((cat) => {
                  const active = isLinkActive(cat.to)
                  return (
                    <button
                      key={cat.to}
                      onClick={() => {
                        navigate(cat.to)
                        setDropdownOpen(false)
                      }}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold transition-all duration-150 ${
                        active
                          ? 'bg-primary-50 text-primary-700 shadow-2xs ring-1 ring-primary-200/50 dark:bg-slate-800 dark:text-brand dark:ring-slate-700'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/80 dark:hover:text-white'
                      }`}
                    >
                      <cat.icon className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
                      <span className="truncate">{cat.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/tools')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
              location.pathname === '/tools'
                ? 'bg-primary-50 text-primary-700 shadow-2xs ring-1 ring-primary-200/50 dark:bg-slate-800 dark:text-brand dark:ring-slate-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white'
            }`}
          >
            All Tools
          </button>

          <button
            onClick={() => navigate('/blogs')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
              location.pathname.startsWith('/blogs')
                ? 'bg-primary-50 text-primary-700 shadow-2xs ring-1 ring-primary-200/50 dark:bg-slate-800 dark:text-brand dark:ring-slate-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white'
            }`}
          >
            Blogs
          </button>
        </nav>

        {/* Search trigger: On homepage top, simplify to compact icon trigger to avoid redundancy with Hero search; reveal full input once scrolled past hero */}
        {isHome && !scrolledPastHero ? (
          <button
            onClick={() => setSearchOpen(true)}
            title="Search tools (Ctrl+K)"
            aria-label="Search tools"
            className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-slate-50 text-slate-500 transition-all duration-200 hover:border-primary-400 hover:text-primary-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
          >
            <Search className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-400 transition-all duration-200 hover:border-primary-400 hover:text-primary-600 sm:flex dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
          >
            <Search className="h-4 w-4" />
            <span>Search tools...</span>
            <kbd className="rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              Ctrl K
            </kbd>
          </button>
        )}

        <button
          onClick={() => setSearchOpen(true)}
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-slate-50 text-slate-500 transition hover:border-primary-400 sm:hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
          aria-label="Search tools"
        >
          <Search className="h-4 w-4" />
        </button>

        <div className="hidden sm:block">{ThemeButton}</div>

        {/* User Account / Sign In */}
        {isAuthenticated && user ? (
          <div className="relative hidden sm:block" onMouseLeave={() => setUserMenuOpen(false)}>
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white/90 py-1.5 pl-2 pr-3 text-xs font-bold text-slate-800 shadow-2xs transition-all hover:border-primary-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-primary-600 to-indigo-600 text-[11px] font-extrabold text-white">
                {user.name.slice(0, 2).toUpperCase()}
              </span>
              <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-1.5 w-56 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-[#111827]">
                <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
                  <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{user.email}</p>
                </div>
                <div className="pt-1">
                  <button
                    onClick={() => {
                      navigate('/profile')
                      setUserMenuOpen(false)
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/80"
                  >
                    <span className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-slate-400" /> My Profile
                    </span>
                    {(user.favoriteToolIds?.length ?? 0) > 0 && (
                      <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-700 dark:bg-primary-950/60 dark:text-primary-300">
                        {user.favoriteToolIds?.length ?? 0}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      navigate('/profile')
                      setUserMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/80"
                  >
                    <Star className="h-3.5 w-3.5 text-amber-500" /> Saved Favorites
                  </button>
                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                  <button
                    onClick={() => {
                      logout()
                      setUserMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => navigate('/login')}
              className="rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="group relative inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary-600 via-[#9D388A] to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-primary-500/25 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:shadow-primary-500/35 hover:brightness-110 active:scale-[0.98]"
            >
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
        )}

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 text-slate-600 md:hidden dark:border-slate-700 dark:text-slate-300"
          aria-label="Toggle menu"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 md:hidden dark:border-slate-800 dark:bg-[#111827]">
          <div className="grid grid-cols-1 gap-1">
            <button
              onClick={() => {
                navigate('/')
                setMobileOpen(false)
              }}
              className={`rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                location.pathname === '/'
                  ? 'bg-primary-50 text-primary-700 dark:bg-slate-800 dark:text-brand'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => setMobileCategoriesOpen((v) => !v)}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <span>Categories ({categoryLinks.length})</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${mobileCategoriesOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {mobileCategoriesOpen && (
              <div className="ml-2.5 grid grid-cols-1 gap-1 border-l-2 border-slate-200 pl-2.5 my-1 dark:border-slate-700">
                {categoryLinks.map((cat) => {
                  const active = isLinkActive(cat.to)
                  return (
                    <button
                      key={cat.to}
                      onClick={() => {
                        navigate(cat.to)
                        setMobileOpen(false)
                      }}
                      className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold ${
                        active
                          ? 'bg-primary-50 text-primary-700 dark:bg-slate-800 dark:text-brand'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <cat.icon className="h-3.5 w-3.5" />
                      <span>{cat.label}</span>
                    </button>
                  )
                })}
              </div>
            )}

            <button
              onClick={() => {
                navigate('/tools')
                setMobileOpen(false)
              }}
              className={`rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                location.pathname === '/tools'
                  ? 'bg-primary-50 text-primary-700 dark:bg-slate-800 dark:text-brand'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              All Tools
            </button>

            <button
              onClick={() => {
                navigate('/blogs')
                setMobileOpen(false)
              }}
              className={`rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                location.pathname.startsWith('/blogs')
                  ? 'bg-primary-50 text-primary-700 dark:bg-slate-800 dark:text-brand'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              Blogs
            </button>

            {isAuthenticated && user ? (
              <div className="mt-2 border-t border-slate-200 pt-2 dark:border-slate-800">
                <div className="flex items-center gap-2.5 px-3 py-1.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600 text-xs font-bold text-white">
                    {user.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                    <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">{user.email}</p>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1 px-1">
                  <button
                    onClick={() => {
                      navigate('/profile')
                      setMobileOpen(false)
                    }}
                    className="rounded-lg bg-slate-100 py-2 text-center text-xs font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      logout()
                      setMobileOpen(false)
                    }}
                    className="rounded-lg bg-rose-50 py-2 text-center text-xs font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2 border-t border-slate-200 pt-2 dark:border-slate-800">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      navigate('/login')
                      setMobileOpen(false)
                    }}
                    className="flex items-center justify-center rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      navigate('/register')
                      setMobileOpen(false)
                    }}
                    className="flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-600 via-[#9D388A] to-indigo-600 py-2.5 text-xs font-bold text-white shadow-md transition hover:brightness-105"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            )}

            <div className="mt-2 border-t border-slate-200 pt-2 dark:border-slate-800">{ThemeButton}</div>
          </div>
        </nav>
      )}

      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}