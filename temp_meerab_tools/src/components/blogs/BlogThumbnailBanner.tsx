import {
  Clock,
  Shield,
  FileText,
  Image as ImageIcon,
  Cpu,
  Terminal,
  Sparkles,
  Layers,
  Gauge,
  Lock,
  Workflow,
  Code2,
} from 'lucide-react'

export interface BlogThumbnailBannerProps {
  title: string
  category: string
  readingMinutes: number
  badge?: string
  theme?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

interface ThemeConfig {
  gradient: string
  darkGradient: string
  badgeBg: string
  badgeText: string
  border: string
  darkBorder: string
  accentIcon: typeof Shield
  patternColor: string
}

const THEME_MAP: Record<string, ThemeConfig> = {
  emerald: {
    gradient: 'from-emerald-50 via-teal-50/70 to-emerald-100/60',
    darkGradient: 'dark:from-emerald-950/40 dark:via-slate-900 dark:to-teal-950/30',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200/80',
    darkBorder: 'dark:border-emerald-900/40',
    accentIcon: Lock,
    patternColor: 'rgba(16, 185, 129, 0.12)',
  },
  sky: {
    gradient: 'from-sky-50 via-blue-50/70 to-sky-100/60',
    darkGradient: 'dark:from-sky-950/40 dark:via-slate-900 dark:to-blue-950/30',
    badgeBg: 'bg-sky-500/15 border-sky-500/30 text-sky-700 dark:bg-sky-500/20 dark:border-sky-500/40 dark:text-sky-300',
    badgeText: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-200/80',
    darkBorder: 'dark:border-sky-900/40',
    accentIcon: FileText,
    patternColor: 'rgba(14, 165, 233, 0.12)',
  },
  indigo: {
    gradient: 'from-indigo-50 via-slate-50/60 to-indigo-100/60',
    darkGradient: 'dark:from-indigo-950/40 dark:via-slate-900 dark:to-indigo-950/30',
    badgeBg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/40 dark:text-indigo-300',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200/80',
    darkBorder: 'dark:border-indigo-900/40',
    accentIcon: Code2,
    patternColor: 'rgba(99, 102, 241, 0.12)',
  },
  purple: {
    gradient: 'from-purple-50 via-violet-50/70 to-purple-100/60',
    darkGradient: 'dark:from-purple-950/40 dark:via-slate-900 dark:to-violet-950/30',
    badgeBg: 'bg-purple-500/15 border-purple-500/30 text-purple-700 dark:bg-purple-500/20 dark:border-purple-500/40 dark:text-purple-300',
    badgeText: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200/80',
    darkBorder: 'dark:border-purple-900/40',
    accentIcon: Sparkles,
    patternColor: 'rgba(168, 85, 247, 0.12)',
  },
  rose: {
    gradient: 'from-rose-50 via-pink-50/70 to-rose-100/60',
    darkGradient: 'dark:from-rose-950/40 dark:via-slate-900 dark:to-pink-950/30',
    badgeBg: 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:bg-rose-500/20 dark:border-rose-500/40 dark:text-rose-300',
    badgeText: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200/80',
    darkBorder: 'dark:border-rose-900/40',
    accentIcon: Sparkles,
    patternColor: 'rgba(244, 63, 94, 0.12)',
  },
  amber: {
    gradient: 'from-amber-50 via-yellow-50/70 to-amber-100/60',
    darkGradient: 'dark:from-amber-950/40 dark:via-slate-900 dark:to-yellow-950/30',
    badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:bg-amber-500/20 dark:border-amber-500/40 dark:text-amber-300',
    badgeText: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200/80',
    darkBorder: 'dark:border-amber-900/40',
    accentIcon: Workflow,
    patternColor: 'rgba(245, 158, 11, 0.12)',
  },
  teal: {
    gradient: 'from-teal-50 via-emerald-50/70 to-teal-100/60',
    darkGradient: 'dark:from-teal-950/40 dark:via-slate-900 dark:to-emerald-950/30',
    badgeBg: 'bg-teal-500/15 border-teal-500/30 text-teal-700 dark:bg-teal-500/20 dark:border-teal-500/40 dark:text-teal-300',
    badgeText: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-200/80',
    darkBorder: 'dark:border-teal-900/40',
    accentIcon: Gauge,
    patternColor: 'rgba(20, 184, 166, 0.12)',
  },
  cyan: {
    gradient: 'from-cyan-50 via-sky-50/70 to-cyan-100/60',
    darkGradient: 'dark:from-cyan-950/40 dark:via-slate-900 dark:to-sky-950/30',
    badgeBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-700 dark:bg-cyan-500/20 dark:border-cyan-500/40 dark:text-cyan-300',
    badgeText: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-200/80',
    darkBorder: 'dark:border-cyan-900/40',
    accentIcon: Layers,
    patternColor: 'rgba(6, 182, 212, 0.12)',
  },
  blue: {
    gradient: 'from-blue-50 via-indigo-50/70 to-blue-100/60',
    darkGradient: 'dark:from-blue-950/40 dark:via-slate-900 dark:to-indigo-950/30',
    badgeBg: 'bg-blue-500/15 border-blue-500/30 text-blue-700 dark:bg-blue-500/20 dark:border-blue-500/40 dark:text-blue-300',
    badgeText: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200/80',
    darkBorder: 'dark:border-blue-900/40',
    accentIcon: Cpu,
    patternColor: 'rgba(59, 130, 246, 0.12)',
  },
  violet: {
    gradient: 'from-violet-50 via-purple-50/70 to-violet-100/60',
    darkGradient: 'dark:from-violet-950/40 dark:via-slate-900 dark:to-purple-950/30',
    badgeBg: 'bg-violet-500/15 border-violet-500/30 text-violet-700 dark:bg-violet-500/20 dark:border-violet-500/40 dark:text-violet-300',
    badgeText: 'text-violet-700 dark:text-violet-300',
    border: 'border-violet-200/80',
    darkBorder: 'dark:border-violet-900/40',
    accentIcon: Sparkles,
    patternColor: 'rgba(139, 92, 246, 0.12)',
  },
  red: {
    gradient: 'from-rose-50 via-red-50/70 to-rose-100/60',
    darkGradient: 'dark:from-rose-950/40 dark:via-slate-900 dark:to-red-950/30',
    badgeBg: 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:bg-rose-500/20 dark:border-rose-500/40 dark:text-rose-300',
    badgeText: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200/80',
    darkBorder: 'dark:border-rose-900/40',
    accentIcon: Shield,
    patternColor: 'rgba(239, 68, 68, 0.12)',
  },
  slate: {
    gradient: 'from-slate-100 via-gray-50 to-slate-200/60',
    darkGradient: 'dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950',
    badgeBg: 'bg-slate-500/15 border-slate-500/30 text-slate-700 dark:bg-slate-500/20 dark:border-slate-500/40 dark:text-slate-300',
    badgeText: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-300/80',
    darkBorder: 'dark:border-slate-800',
    accentIcon: Terminal,
    patternColor: 'rgba(100, 116, 139, 0.12)',
  },
}

const CATEGORY_DEFAULT_THEME: Record<string, string> = {
  'Privacy & Security': 'emerald',
  'PDF & Documents': 'sky',
  'Image & Media': 'rose',
  'Web Performance & Wasm': 'teal',
  'Developer Tools': 'indigo',
  'AI & Machine Learning': 'purple',
  'Productivity & Office': 'amber',
}

const CATEGORY_ICONS: Record<string, typeof Shield> = {
  'Privacy & Security': Lock,
  'PDF & Documents': FileText,
  'Image & Media': ImageIcon,
  'Web Performance & Wasm': Gauge,
  'Developer Tools': Terminal,
  'AI & Machine Learning': Sparkles,
  'Productivity & Office': Workflow,
}

export function BlogThumbnailBanner({
  title,
  category,
  readingMinutes,
  badge,
  theme,
  className = '',
  size = 'md',
}: BlogThumbnailBannerProps) {
  const resolvedThemeKey = theme || CATEGORY_DEFAULT_THEME[category] || 'indigo'
  const config = THEME_MAP[resolvedThemeKey] ?? THEME_MAP.indigo
  const IconComponent = CATEGORY_ICONS[category] ?? config.accentIcon
  const displayBadge = badge || category.toUpperCase()

  const isLarge = size === 'lg'

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-t-2xl border-b bg-gradient-to-br select-none transition-all duration-300 ${config.gradient} ${config.darkGradient} ${config.border} ${config.darkBorder} ${
        isLarge ? 'p-6 sm:p-8' : 'p-5'
      } ${className}`}
    >
      {/* Chrome for Developers Style Decorative SVG Tech Grid */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-40 dark:opacity-25"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id={`grid-${resolvedThemeKey}`} width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1" fill={config.patternColor} />
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke={config.patternColor}
              strokeWidth="0.5"
              strokeDasharray="2 4"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${resolvedThemeKey})`} />
      </svg>

      {/* Ambient gradient glow orbs */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/50 blur-2xl dark:bg-white/5" />
      <div className="pointer-events-none absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-white/40 blur-2xl dark:bg-white/5" />

      {/* Top row: Category tag & reading time */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-wider uppercase backdrop-blur-xs ${config.badgeBg}`}
        >
          <IconComponent className="h-3 w-3" />
          {displayBadge}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-slate-200/60 bg-white/80 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600 shadow-2xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
          <Clock className="h-3 w-3 text-slate-400" />
          {readingMinutes} min
        </span>
      </div>

      {/* Middle visual graphic container (Chrome for Developers Card Header) */}
      <div className="relative z-10 my-auto py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/80 bg-white/70 shadow-xs backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/80">
            <IconComponent className={`h-5 w-5 ${config.badgeText}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-extrabold tracking-tight text-slate-900 transition-colors dark:text-slate-100 sm:text-base">
              {title}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom subtle indicator */}
      <div className="relative z-10 flex items-center justify-between border-t border-slate-200/40 pt-2.5 text-[11px] text-slate-500 dark:border-slate-800/50 dark:text-slate-400">
        <span className="font-medium">{category}</span>
        <span className="font-mono text-[10px] tracking-wide uppercase text-slate-400 dark:text-slate-500">
          Browser Architecture
        </span>
      </div>
    </div>
  )
}

export default BlogThumbnailBanner
