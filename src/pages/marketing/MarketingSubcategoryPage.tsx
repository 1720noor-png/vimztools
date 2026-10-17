import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Seo from '../../components/ui/Seo'
import { ToolCard } from '../../components/ui/Cards'
import { findMarketingSubcategory, marketingToolsFor } from './marketingConfig'

export default function MarketingSubcategoryPage() {
  const { subcategory } = useParams<{ subcategory: string }>()
  const sub = subcategory ? findMarketingSubcategory(subcategory) : undefined

  if (!sub) return <Navigate to="/marketers-seo" replace />

  const tools = marketingToolsFor(sub.id)
  const Icon = sub.icon

  return (
    <>
      <Seo
        title={`${sub.title} - Free Online Tools | vimz Tools`}
        description={`Free ${sub.title.toLowerCase()} tools - ${sub.description}`}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-3 text-xs font-medium text-slate-400">
          <Link to="/" className="hover:text-primary-600">
            Home
          </Link>
          <span className="mx-1">/</span>
          <Link to="/marketers-seo" className="hover:text-primary-600">
            Marketers &amp; SEO Specialists
          </Link>
          <span className="mx-1">/</span>
          <span>{sub.title}</span>
        </nav>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-indigo-200/90 bg-gradient-to-r from-indigo-50 via-white to-blue-50 p-6 shadow-sm dark:border-indigo-900/40 dark:from-indigo-950/40 dark:via-[#111827] dark:to-blue-950/20">
          <div className="flex items-center gap-4">
            <span
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-2xl shadow-2xs ${sub.accent}`}
            >
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">{sub.title}</h1>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                {sub.tagline}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {tools.length} {tools.length === 1 ? 'tool' : 'tools'} in this marketing suite
              </p>
            </div>
          </div>
          <Link
            to="/marketers-seo"
            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-2xs transition hover:bg-indigo-50 hover:text-indigo-800 dark:border-indigo-900 dark:bg-slate-900 dark:text-indigo-300"
          >
            <ArrowLeft className="h-4 w-4" />
            All Marketers &amp; SEO categories
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