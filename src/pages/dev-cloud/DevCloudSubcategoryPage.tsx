import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Seo from '../../components/ui/Seo'
import { ToolCard } from '../../components/ui/Cards'
import CategoryTopSearchBar from '../../components/ui/CategoryTopSearchBar'
import {
  findDevCloudSubcategory,
  DEV_CLOUD_TOOLS,
} from './devCloudConfig'

export default function DevCloudSubcategoryPage() {
  const { subcategory } = useParams<{ subcategory: string }>()
  const [query, setQuery] = useState('')

  const sub = findDevCloudSubcategory(subcategory ?? '')

  const tools = useMemo(() => {
    if (!sub) return []
    return DEV_CLOUD_TOOLS.filter((t) => sub.toolIds.includes(t.id))
  }, [sub])

  const filteredTools = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tools
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.toLowerCase().includes(q))
    )
  }, [tools, query])

  if (!sub) return <Navigate to="/dev-cloud" replace />

  const Icon = sub.icon

  return (
    <>
      <Seo
        title={`${sub.title} — Developer & Cloud Tools`}
        description={sub.description}
      />

      <div className="min-h-screen pb-20">
        {/* Subcategory Hero Header */}
        <section className="border-b border-cyan-100 bg-gradient-to-b from-cyan-50/70 to-transparent py-10 dark:border-cyan-900/30 dark:from-cyan-950/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link
              to="/dev-cloud"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-700 hover:text-cyan-800 dark:text-cyan-400 dark:hover:text-cyan-300 mb-4"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Developer & Cloud Hub
            </Link>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-cyan-600 text-white shadow-lg shadow-cyan-600/20 dark:bg-cyan-500">
                <Icon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 sm:text-3xl dark:text-white">
                  {sub.title}
                </h1>
                <p className="mt-1 text-sm text-cyan-800 font-medium dark:text-cyan-300">
                  {sub.tagline}
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-3xl">
                  {sub.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Content View */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
          <div className="sticky top-20 z-30 mb-8 bg-white/80 py-2 backdrop-blur-md dark:bg-slate-900/80">
            <CategoryTopSearchBar
              placeholder={`Search within ${sub.title.toLowerCase()}...`}
              value={query}
              onChange={setQuery}
            />
          </div>

          <div className="mb-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Showing {filteredTools.length} of {tools.length} engineering utilities</span>
            <span>100% Client-Side In-Browser Execution</span>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-base text-slate-500 dark:text-slate-400">
                No tools matched &quot;{query}&quot; in this folder.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
