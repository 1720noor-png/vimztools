import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Seo from '../../components/ui/Seo'
import { ToolCard } from '../../components/ui/Cards'
import { findWomenSubcategory, womenToolsFor } from './womenConfig'

export default function WomenSubcategoryPage() {
  const { subcategory } = useParams<{ subcategory: string }>()
  const sub = subcategory ? findWomenSubcategory(subcategory) : undefined

  if (!sub) return <Navigate to="/women" replace />

  const tools = womenToolsFor(sub.id)
  const Icon = sub.icon

  return (
    <>
      <Seo
        title={`${sub.title} Tools for Women - Free Online | vimz Tools`}
        description={`Free ${sub.title.toLowerCase()} tools for women - ${sub.description}`}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-3 text-xs font-medium text-slate-400">
          <Link to="/" className="hover:text-primary-600">
            Home
          </Link>
          <span className="mx-1">/</span>
          <Link to="/women" className="hover:text-primary-600">
            Women
          </Link>
          <span className="mx-1">/</span>
          <span>{sub.title}</span>
        </nav>

        <div className="relative mb-8 overflow-hidden rounded-3xl border border-rose-200/80 bg-gradient-to-r from-rose-50/90 via-pink-50/50 to-rose-50/80 p-6 shadow-sm dark:border-rose-900/40 dark:from-rose-950/30 dark:via-slate-900/40 dark:to-pink-950/20 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-sm ${sub.accent}`}
              >
                <Icon className="h-7 w-7" />
              </span>
              <div>
                <span className="inline-flex items-center rounded-full border border-rose-200 bg-white/80 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 shadow-2xs dark:border-rose-800/80 dark:bg-slate-800/90 dark:text-rose-300">
                  Women &middot; {sub.title}
                </span>
                <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                  {sub.title}
                </h1>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-rose-500/80 dark:text-rose-400/80">
                  {sub.tagline}
                </p>
              </div>
            </div>
            <Link
              to="/women"
              className="flex items-center gap-1.5 rounded-xl border border-slate-300/90 bg-white/90 px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-xs backdrop-blur-sm transition hover:border-rose-400 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-200 dark:hover:border-rose-500"
            >
              <ArrowLeft className="h-4 w-4" />
              All Women categories
            </Link>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {tools.length} {tools.length === 1 ? 'tool' : 'tools'} in {sub.title} &mdash; {sub.description}
          </p>
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