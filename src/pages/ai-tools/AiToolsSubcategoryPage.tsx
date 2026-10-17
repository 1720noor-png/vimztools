import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Seo from '../../components/ui/Seo'
import { ToolCard } from '../../components/ui/Cards'
import CategoryTopSearchBar from '../../components/ui/CategoryTopSearchBar'
import {
  findAiSubcategory,
  AI_TOOLS,
} from './aiToolsConfig'

export default function AiToolsSubcategoryPage() {
  const { subcategory } = useParams<{ subcategory: string }>()
  const [query, setQuery] = useState('')

  const sub = findAiSubcategory(subcategory ?? '')

  const tools = useMemo(() => {
    if (!sub) return []
    return AI_TOOLS.filter((t) => sub.toolIds.includes(t.id))
  }, [sub])

  const filteredTools = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tools
    return tools.filter((t) =>
      [t.name, t.description, ...(t.keywords ?? [])].join(' ').toLowerCase().includes(q),
    )
  }, [tools, query])

  if (!sub) return <Navigate to="/ai-tools" replace />

  const Icon = sub.icon

  return (
    <>
      <Seo
        title={`${sub.title} — AI & Machine Learning Tools | vimz Tools`}
        description={sub.description}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-3 text-xs font-medium text-slate-400">
          <Link to="/" className="hover:text-primary-600">
            Home
          </Link>
          <span className="mx-1">/</span>
          <Link to="/ai-tools" className="hover:text-primary-600">
            AI &amp; Machine Learning
          </Link>
          <span className="mx-1">/</span>
          <span>{sub.title}</span>
        </nav>

        <div className="relative mb-8 overflow-hidden rounded-3xl border border-violet-200/80 bg-gradient-to-r from-violet-50/90 via-purple-50/40 to-violet-50/80 p-6 shadow-sm dark:border-violet-900/40 dark:from-violet-950/30 dark:via-slate-900/40 dark:to-purple-950/20 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-violet-200 bg-white/80 text-violet-600 shadow-sm dark:border-violet-800/80 dark:bg-slate-800/90 dark:text-violet-300">
                <Icon className="h-7 w-7" />
              </span>
              <div>
                <span className="inline-flex items-center rounded-full border border-violet-200 bg-white/80 px-2.5 py-0.5 text-[11px] font-bold text-violet-700 shadow-2xs dark:border-violet-800/80 dark:bg-slate-800/90 dark:text-violet-300">
                  AI &amp; Machine Learning
                </span>
                <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                  {sub.title}
                </h1>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-violet-600/80 dark:text-violet-400/80">
                  {sub.tagline}
                </p>
              </div>
            </div>
            <Link
              to="/ai-tools"
              className="flex items-center gap-1.5 rounded-xl border border-slate-300/90 bg-white/90 px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-xs backdrop-blur-sm transition hover:border-violet-400 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-200 dark:hover:border-violet-500"
            >
              <ArrowLeft className="h-4 w-4" />
              All AI categories
            </Link>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {sub.description}
          </p>
        </div>

        {/* Top Search Bar */}
        <div className="mb-8">
          <CategoryTopSearchBar
            value={query}
            onChange={setQuery}
            placeholder={`Search tools within ${sub.title}...`}
            categoryName={sub.title}
            toolCount={filteredTools.length}
          />
        </div>

        {filteredTools.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="font-semibold text-slate-700 dark:text-slate-300">No matching tools found</p>
            <p className="mt-1 text-xs text-slate-400">Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTools.map((tool, i) => (
              <div key={tool.id} className="animate-fade-up" style={{ animationDelay: `${i * 35}ms` }}>
                <ToolCard tool={tool} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
