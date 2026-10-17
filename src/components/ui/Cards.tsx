import { Link } from 'react-router-dom'
import {
  ArrowRight,
  FileText,
  Image,
  FilePlus2,
  HeartPulse,
  Zap,
  Wallet,
  Home,
  ChefHat,
  GraduationCap,
  Briefcase,
  Dumbbell,
  Sofa,
  Sparkles,
  Ribbon,
  Boxes,
  Megaphone,
  Users,
  Truck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { CSSProperties } from 'react'
import { categories, tools } from '../../lib/catalog'
import { getCategoryAccent, DEFAULT_CATEGORY_ACCENT } from '../../lib/categoryAccents'

const iconMap: Record<string, LucideIcon> = {
  FileText,
  Image,
  FilePlus2,
  HeartPulse,
  Zap,
  Wallet,
  Home,
  ChefHat,
  GraduationCap,
  Briefcase,
  Dumbbell,
  Sofa,
  Sparkles,
  Ribbon,
  Boxes,
  Megaphone,
  Users,
  Truck,
}

export function CategoryCard({
  category,
  count,
}: {
  category: (typeof categories)[number]
  count?: number
}) {
  const Icon = iconMap[category.icon] ?? Zap
  const catTools = tools.filter((t) => t.categoryId === category.id)
  const displayCount = count ?? catTools.length
  const accent =
    getCategoryAccent(category.path) ||
    getCategoryAccent('/tools/' + category.id) ||
    DEFAULT_CATEGORY_ACCENT

  return (
    <Link
      to={category.path}
      style={
        {
          '--cat-bg': accent.bg,
          '--cat-bg-dark': accent.bgDark,
          '--cat-accent': accent.accent,
        } as CSSProperties
      }
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--cat-accent)_30%,#e2e8f0)] bg-[linear-gradient(145deg,#ffffff_0%,color-mix(in_srgb,var(--cat-bg)_65%,#ffffff)_100%)] p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[var(--cat-accent)] hover:shadow-xl hover:shadow-[color-mix(in_srgb,var(--cat-accent)_20%,transparent)] dark:border-[color-mix(in_srgb,var(--cat-accent)_40%,#1f2937)] dark:bg-[linear-gradient(145deg,#111827_0%,color-mix(in_srgb,var(--cat-bg-dark)_45%,#111827)_100%)] dark:hover:border-[var(--cat-accent)] dark:hover:shadow-2xl dark:hover:shadow-[color-mix(in_srgb,var(--cat-accent)_30%,transparent)]"
    >
      <div>
        <div className="flex items-center justify-between">
          <span
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105"
            style={{
              backgroundColor: `color-mix(in srgb, ${accent.accent} 14%, #ffffff)`,
              borderColor: `color-mix(in srgb, ${accent.accent} 30%, transparent)`,
              color: accent.accent,
            }}
          >
            <Icon className="h-5 w-5" />
          </span>
          <span
            className="rounded-full border px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-200 shadow-2xs"
            style={{
              backgroundColor: `color-mix(in srgb, ${accent.accent} 14%, #ffffff)`,
              borderColor: `color-mix(in srgb, ${accent.accent} 35%, #cbd5e1)`,
            }}
          >
            {displayCount} {displayCount === 1 ? 'tool' : 'tools'}
          </span>
        </div>
        <h3 className="mt-3.5 text-base font-bold text-slate-900 transition-colors duration-200 group-hover:text-slate-950 dark:text-slate-100 dark:group-hover:text-white">
          {category.name}
        </h3>
      </div>
      <div className="mt-4 flex items-center justify-end">
        <span
          className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white shadow-2xs transition-all duration-200 group-hover:gap-1.5 group-hover:shadow-md group-hover:brightness-105"
          style={{ backgroundColor: accent.accent }}
        >
          Explore <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}

export function ToolCard({ tool }: { tool: (typeof tools)[number] }) {
  const accent =
    getCategoryAccent(tool.path) ||
    getCategoryAccent('/tools/' + tool.categoryId) ||
    getCategoryAccent(tool.categoryId) ||
    DEFAULT_CATEGORY_ACCENT

  return (
    <Link
      to={tool.path}
      style={
        {
          '--card-bg': accent.bg,
          '--card-bg-dark': accent.bgDark,
          '--card-accent': accent.accent,
        } as CSSProperties
      }
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--card-accent)_30%,#e2e8f0)] bg-[linear-gradient(145deg,#ffffff_0%,color-mix(in_srgb,var(--card-bg)_65%,#ffffff)_100%)] p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[var(--card-accent)] hover:shadow-xl hover:shadow-[color-mix(in_srgb,var(--card-accent)_20%,transparent)] dark:border-[color-mix(in_srgb,var(--card-accent)_40%,#1f2937)] dark:bg-[linear-gradient(145deg,#111827_0%,color-mix(in_srgb,var(--card-bg-dark)_45%,#111827)_100%)] dark:hover:border-[var(--card-accent)] dark:hover:shadow-2xl dark:hover:shadow-[color-mix(in_srgb,var(--card-accent)_30%,transparent)]"
    >
      <div>
        <div className="flex items-center justify-between">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl border transition duration-200 group-hover:scale-105"
            style={{
              backgroundColor: `color-mix(in srgb, ${accent.accent} 14%, #ffffff)`,
              borderColor: `color-mix(in srgb, ${accent.accent} 30%, transparent)`,
              color: accent.accent,
            }}
          >
            <ArrowRight className="h-4 w-4" />
          </span>
          <span
            className="rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase"
            style={{
              backgroundColor: `color-mix(in srgb, ${accent.accent} 12%, #ffffff)`,
              borderColor: `color-mix(in srgb, ${accent.accent} 28%, transparent)`,
              color: accent.accent,
            }}
          >
            {tool.category}
          </span>
        </div>
        <h4 className="mt-3.5 text-sm font-bold text-slate-900 transition-colors duration-200 group-hover:text-slate-950 dark:text-slate-100 dark:group-hover:text-white">
          {tool.name}
        </h4>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {tool.description}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-end">
        <span
          className="inline-flex items-center gap-1 text-xs font-bold transition-all duration-200 group-hover:gap-1.5"
          style={{ color: accent.accent }}
        >
          Open Tool <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}