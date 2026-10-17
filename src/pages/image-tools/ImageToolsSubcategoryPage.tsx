import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Seo from '../../components/ui/Seo'
import { ToolCard } from '../../components/ui/Cards'
import { getToolById } from '../../lib/catalog'
import { getImageSubcategory, imageSubcategories } from './imageToolsConfig'

export default function ImageToolsSubcategoryPage() {
  const { subcategory } = useParams<{ subcategory: string }>()
  const sub = subcategory ? getImageSubcategory(subcategory) : undefined

  if (!sub) return <Navigate to="/image-tools" replace />

  const tools = sub.toolIds.map((id) => getToolById(id)).filter((t): t is NonNullable<typeof t> => Boolean(t))
  const Icon = sub.icon

  return (
    <>
      <Seo
        title={`${sub.title} - Free Online ${sub.title} Tools | vimz Tools`}
        description={`${tools.length} free ${sub.title.toLowerCase()} tools - ${sub.tagline}. All processing happens in your browser, so your images never leave your device.`}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-3 text-xs font-medium text-slate-400">
          <Link to="/" className="hover:text-primary-600">
            Home
          </Link>
          <span className="mx-1">/</span>
          <Link to="/image-tools" className="hover:text-primary-600">
            Image Tools
          </Link>
          <span className="mx-1">/</span>
          <span>{sub.title}</span>
        </nav>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-sky-200/90 bg-gradient-to-r from-sky-50 via-white to-blue-50 p-6 shadow-sm dark:border-sky-900/40 dark:from-sky-950/40 dark:via-[#111827] dark:to-blue-950/20">
          <div className="flex items-center gap-4">
            <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-xl shadow-2xs ${sub.accent}`}>
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">{sub.title}</h1>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">{sub.tagline}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {tools.length} {tools.length === 1 ? 'tool' : 'tools'} in this category · 100% on-device processing
              </p>
            </div>
          </div>
          <Link
            to="/image-tools"
            className="flex items-center gap-1.5 rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 shadow-2xs transition hover:bg-sky-50 hover:text-sky-800 dark:border-sky-900 dark:bg-slate-900 dark:text-sky-300"
          >
            <ArrowLeft className="h-4 w-4" />
            All Image Tools
          </Link>
        </div>

        {tools.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            No tools are mapped to this folder yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tools.map((t, i) => (
              <div key={t.id} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                <ToolCard tool={t} />
              </div>
            ))}
          </div>
        )}

        <nav className="mt-10 flex flex-wrap gap-2" aria-label="Other image categories">
          {imageSubcategories
            .filter((s) => s.id !== sub.id)
            .map((s) => (
              <Link
                key={s.id}
                to={`/image-tools/${s.id}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-brand hover:text-brand"
              >
                {s.title}
              </Link>
            ))}
        </nav>
      </div>
    </>
  )
}
