import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import type { CSSProperties } from 'react'
import { getCategoryAccent, DEFAULT_CATEGORY_ACCENT } from '../../lib/categoryAccents'

export interface SubcategoryCardProps {
  title: string
  count: number
  icon: LucideIcon
  description?: string
  to?: string
  onClick?: () => void
  index?: number
  tagline?: string
  className?: string
}

export default function SubcategoryCard({
  title,
  count,
  icon: Icon,
  description,
  to,
  onClick,
  tagline,
  className = '',
}: SubcategoryCardProps) {
  const accent = getCategoryAccent(to) || getCategoryAccent(title) || DEFAULT_CATEGORY_ACCENT

  const innerContent = (
    <>
      {/* Top row: High Iconography & Tool Count Badge */}
      <div className="flex w-full items-center justify-between">
        <span
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105"
          style={{
            backgroundColor: `color-mix(in srgb, ${accent.accent} 14%, #ffffff)`,
            borderColor: `color-mix(in srgb, ${accent.accent} 30%, transparent)`,
            color: accent.accent,
          }}
        >
          <Icon className="h-5 w-5" aria-hidden="true" strokeWidth={2} />
        </span>
        <span
          className="rounded-full border px-2.5 py-0.5 text-xs font-semibold"
          style={{
            backgroundColor: `color-mix(in srgb, ${accent.accent} 12%, #ffffff)`,
            borderColor: `color-mix(in srgb, ${accent.accent} 28%, transparent)`,
            color: accent.accent,
          }}
        >
          {count} {count === 1 ? 'tool' : 'tools'}
        </span>
      </div>

      {/* Subcategory Title */}
      <h3 className="mt-3.5 text-base font-bold text-slate-900 transition-colors duration-200 group-hover:text-slate-950 dark:text-slate-100 dark:group-hover:text-white">
        {title}
      </h3>

      {/* Tagline if provided */}
      {tagline && (
        <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {tagline}
        </p>
      )}

      {/* Smart Hover-Only Description Reveal Container */}
      <div className="relative mt-2 min-h-[2.5rem] w-full overflow-hidden">
        <p className="line-clamp-2 text-xs leading-relaxed text-slate-500 opacity-0 translate-y-1 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 dark:text-slate-400">
          {description || `Browse all ${count} specialized tools and utilities in this folder.`}
        </p>
      </div>

      {/* Interactive Explore Link */}
      <span
        className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold transition-all duration-200 group-hover:gap-1.5"
        style={{ color: accent.accent }}
      >
        Explore folder{' '}
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </>
  )

  const commonClasses = `group relative flex flex-col items-start overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--card-accent)_30%,#e2e8f0)] bg-[linear-gradient(145deg,#ffffff_0%,color-mix(in_srgb,var(--card-bg)_65%,#ffffff)_100%)] p-5 text-left shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[var(--card-accent)] hover:shadow-xl hover:shadow-[color-mix(in_srgb,var(--card-accent)_20%,transparent)] dark:border-[color-mix(in_srgb,var(--card-accent)_40%,#1f2937)] dark:bg-[linear-gradient(145deg,#111827_0%,color-mix(in_srgb,var(--card-bg-dark)_45%,#111827)_100%)] dark:hover:border-[var(--card-accent)] dark:hover:shadow-2xl dark:hover:shadow-[color-mix(in_srgb,var(--card-accent)_30%,transparent)] cursor-pointer ${className}`

  const cardStyle = {
    '--card-bg': accent.bg,
    '--card-bg-dark': accent.bgDark,
    '--card-accent': accent.accent,
  } as CSSProperties

  if (to) {
    return (
      <Link to={to} className={commonClasses} style={cardStyle}>
        {innerContent}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={commonClasses} style={cardStyle}>
      {innerContent}
    </button>
  )
}

