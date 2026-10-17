import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { CSSProperties } from 'react'
import Seo from '../../components/ui/Seo'
import { ToolCard } from '../../components/ui/Cards'
import { getToolById } from '../../lib/catalog'
import { findHouseholdSubcategory } from './householdConfig'

export default function HouseholdSubcategoryPage() {
  const { subcategory } = useParams<{ subcategory: string }>()
  const sub = subcategory ? findHouseholdSubcategory(subcategory) : undefined

  if (!sub) return <Navigate to="/household" replace />

  const tools = sub.toolIds.map((id) => getToolById(id)).filter((t): t is NonNullable<typeof t> => Boolean(t))

  return (
    <>
      <Seo
        title={`${sub.title} Tools - Household Helpers | vimz Tools`}
        description={`Free ${sub.title.toLowerCase()} household tools - ${sub.description}`}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-3 text-xs font-medium text-slate-400">
          <Link to="/" className="hover:text-primary-600">
            Home
          </Link>
          <span className="mx-1">/</span>
          <Link to="/household" className="hover:text-primary-600">
            Household
          </Link>
          <span className="mx-1">/</span>
          <span>{sub.title}</span>
        </nav>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div
            className="hh-panel flex items-center gap-4 rounded-2xl border p-3 pr-6"
            style={
              {
                '--hh-bg': sub.bg,
                '--hh-border': sub.border,
                '--hh-accent': sub.accent,
                '--hh-bg-dark': sub.darkBg,
              } as CSSProperties
            }
          >
            <span className="hh-emoji inline-flex h-12 w-12 items-center justify-center rounded-2xl border text-xl">
              <span aria-hidden="true">{sub.emoji}</span>
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{sub.title}</h1>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {sub.tagline}
              </p>
            </div>
          </div>
          <Link
            to="/household"
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <ArrowLeft className="h-4 w-4" />
            All Household topics
          </Link>
        </div>

        <p className="mb-8 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {tools.length} {tools.length === 1 ? 'tool' : 'tools'} in {sub.title}.
        </p>

        {tools.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-3xl">{sub.emoji}</p>
            <h3 className="mt-3 text-lg font-bold text-slate-800">Nothing mapped here yet</h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              We are still matching tools for this folder. Check back soon - no dedicated tool matches this category right now.
            </p>
          </section>
        ) : (
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
        )}
      </div>
    </>
  )
}