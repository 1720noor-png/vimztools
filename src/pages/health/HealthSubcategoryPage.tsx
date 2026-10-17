import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Seo from '../../components/ui/Seo'
import { ToolCard } from '../../components/ui/Cards'
import { getToolById } from '../../lib/catalog'
import { findHealthSubcategory } from './healthConfig'

export default function HealthSubcategoryPage() {
  const { subcategory } = useParams<{ subcategory: string }>()
  const sub = subcategory ? findHealthSubcategory(subcategory) : undefined

  if (!sub) return <Navigate to="/health" replace />

  const tools = sub.toolIds.map((id) => getToolById(id)).filter((t): t is NonNullable<typeof t> => Boolean(t))

  return (
    <>
      <Seo
        title={`${sub.title} Tools - Health Calculators | vimz Tools`}
        description={`Free ${sub.title.toLowerCase()} health tools - ${sub.description}`}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-3 text-xs font-medium text-slate-400">
          <Link to="/" className="hover:text-primary-600">
            Home
          </Link>
          <span className="mx-1">/</span>
          <Link to="/health" className="hover:text-primary-600">
            Health
          </Link>
          <span className="mx-1">/</span>
          <span>{sub.title}</span>
        </nav>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-rose-200/90 bg-gradient-to-r from-rose-50 via-white to-pink-50 p-6 shadow-sm dark:border-rose-900/40 dark:from-rose-950/40 dark:via-[#111827] dark:to-pink-950/20">
          <div className="flex items-center gap-4">
            <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-2xl shadow-2xs ${sub.accent}`}>
              <span aria-hidden="true">{sub.emoji}</span>
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">{sub.title}</h1>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400">
                {sub.tagline}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {tools.length} {tools.length === 1 ? 'tool' : 'tools'} available in this health category
              </p>
            </div>
          </div>
          <Link
            to="/health"
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 shadow-2xs transition hover:bg-rose-50 hover:text-rose-800 dark:border-rose-900 dark:bg-slate-900 dark:text-rose-300"
          >
            <ArrowLeft className="h-4 w-4" />
            All Health topics
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools.map((t, i) => (
            <div
              key={t.id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <ToolCard tool={t} />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}