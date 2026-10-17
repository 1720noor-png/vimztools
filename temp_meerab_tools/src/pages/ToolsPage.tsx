import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LayoutGrid, Folder } from 'lucide-react'
import Seo from '../components/ui/Seo'
import { getCategoryById } from '../lib/catalog'
import { useSearch, useToolRegistry } from '../lib/toolRegistry'
import { ToolCard } from '../components/ui/Cards'
import CategoryHero from '../components/ui/CategoryHero'
import { getCategoryAccent } from '../lib/categoryAccents'
import type { ExactCategory } from '../lib/categoryAccents'
import { PDF_SUBCATEGORIES } from './pdf/pdfConfig'
import { DOCUMENT_WORD_SUBCATEGORIES } from './document-word/documentWordConfig'
import CategoryTopSearchBar from '../components/ui/CategoryTopSearchBar'
import SubcategoryCard from '../components/ui/SubcategoryCard'

const DEFAULT_ACCENT: ExactCategory = {
  name: 'All Tools',
  path: '/tools',
  icon: LayoutGrid,
  bg: '#EEF2FF',
  bgDark: '#262c49',
  accent: '#6366F1',
}

export default function ToolsPage() {
  const { category } = useParams<{ category: string }>()
  const [query, setQuery] = useState('')
  const [sub, setSub] = useState<string | null>(null)
  const registry = useToolRegistry()

  const active = useMemo(
    () => (category ? getCategoryById(category) : undefined),
    [category],
  )

  useEffect(() => {
    setSub(null)
  }, [category])

  const filtered = useSearch(registry, query, active?.id)
  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of registry.categories) map.set(c.id, 0)
    for (const t of registry.tools) map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + 1)
    return map
  }, [registry])

  const subs = useMemo(() => active?.subcategories ?? [], [active])
  const pdfSubIconMap = useMemo(
    () => new Map(PDF_SUBCATEGORIES.map((sc) => [sc.title, sc.icon])),
    [],
  )
  const docSubIconMap = useMemo(
    () => new Map(DOCUMENT_WORD_SUBCATEGORIES.map((sc) => [sc.title, sc.icon])),
    [],
  )
  const catTools = useMemo(
    () => (active ? registry.tools.filter((t) => t.categoryId === active.id) : []),
    [registry, active],
  )
  const subCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of subs) map.set(s, 0)
    for (const t of catTools) {
      const key = t.subcategory && subs.includes(t.subcategory) ? t.subcategory : 'Other'
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    return map
  }, [catTools, subs])

  const list = sub ? filtered.filter((t) => t.subcategory === sub) : filtered

  const title = active
    ? `${active.name} - Free Tools | vimz Tools`
    : 'All Tools - 100% Free & Browser-Based | vimz Tools'

  return (
    <>
      <Seo
        title={title}
        description={
          active
            ? `Free ${active.name.toLowerCase()} that run 100% in your browser. ${active.description}`
            : 'Browse every free online tool at vimz Tools. PDF, image, documents, health, finance and text utilities - all private and client-side.'
        }
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <li className="flex items-center gap-1.5">
              <Link to="/" className="transition hover:text-primary-600 dark:hover:text-primary-400">
                Home
              </Link>
              <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">&gt;</span>
            </li>
            {active ? (
              <>
                <li className="flex items-center gap-1.5">
                  {sub ? (
                    <button
                      type="button"
                      onClick={() => setSub(null)}
                      className="cursor-pointer transition hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      {active.name}
                    </button>
                  ) : (
                    <span className="font-semibold text-slate-800 dark:text-slate-200" aria-current="page">
                      {active.name}
                    </span>
                  )}
                  {sub && (
                    <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">&gt;</span>
                  )}
                </li>
                {sub && (
                  <li className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200" aria-current="page">
                      {sub}
                    </span>
                  </li>
                )}
              </>
            ) : (
              <li className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-800 dark:text-slate-200" aria-current="page">
                  All Tools
                </span>
              </li>
            )}
          </ol>
        </nav>

        <div className="mb-8">
          {active ? (
            <CategoryHero
              title={active.name}
              description={active.description}
              icon={getCategoryAccent(`/tools/${active.id}`)?.icon}
              accent={getCategoryAccent(`/tools/${active.id}`) ?? DEFAULT_ACCENT}
            />
          ) : (
            <CategoryHero
              title="All Tools"
              description={`Every free tool in the vimz Tools suite — ${registry.tools.length} and counting. Each one processes data entirely in your browser for total privacy.`}
              icon={DEFAULT_ACCENT.icon}
              accent={DEFAULT_ACCENT}
            />
          )}
        </div>

        {/* Prominent Top Category Search Bar */}
        <div className="mb-8">
          <CategoryTopSearchBar
            value={query}
            onChange={(val) => setQuery(val)}
            placeholder={active ? `Search all ${active.name.toLowerCase()} tools and folders...` : 'Search all tools...'}
            toolCount={list.length}
            categoryName={active?.name}
          />
        </div>

        {/* Global category pills only shown when NOT scoped to an active category */}
        {!active && (
          <div className="mb-6 flex flex-wrap gap-2">
            <Link
              to="/tools"
              className="rounded-full border border-primary-600 bg-primary-600 px-4 py-2 text-sm font-bold text-white transition shadow-sm hover:brightness-105"
            >
              All ({registry.tools.length})
            </Link>
            {registry.categories.map((c) => {
              const catAccent =
                getCategoryAccent('/tools/' + c.id) ||
                getCategoryAccent('/' + c.id) ||
                DEFAULT_ACCENT
              return (
                <Link
                  key={c.id}
                  to={`/tools/${c.id}`}
                  style={{
                    backgroundColor: `color-mix(in srgb, ${catAccent.accent} 12%, #ffffff)`,
                    borderColor: `color-mix(in srgb, ${catAccent.accent} 30%, transparent)`,
                    color: catAccent.accent,
                  }}
                  className="rounded-full border px-4 py-2 text-sm font-bold transition hover:scale-105 hover:shadow-md hover:brightness-105"
                >
                  {c.name} ({counts.get(c.id) ?? 0})
                </Link>
              )
            })}
          </div>
        )}

        {/* Tier 2: Sub-Category Folder Cards (when scoped to a category with subcategories, and no single subcategory selected) */}
        {active && subs.length > 0 && sub === null && !query.trim() && (
          <div className="mb-10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                {active.name} Folders
              </h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {subs.length} folders · {catTools.length} tools
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {subs.map((s, i) => {
                const count = subCounts.get(s) ?? 0
                const SubIcon =
                  (active?.id === 'pdf'
                    ? pdfSubIconMap.get(s)
                    : active?.id === 'document-word'
                      ? docSubIconMap.get(s)
                      : undefined) ?? Folder
                const description =
                  active?.id === 'document-word'
                    ? DOCUMENT_WORD_SUBCATEGORIES.find((sc) => sc.title === s)?.description
                    : active?.id === 'pdf'
                      ? `Specialized PDF tools and utilities for ${s.toLowerCase()}.`
                      : `Tools and utilities in ${s}.`
                return (
                  <SubcategoryCard
                    key={s}
                    title={s}
                    count={count}
                    icon={SubIcon}
                    description={description}
                    index={i}
                    onClick={() => setSub(s)}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* Tier 3: Selected Subcategory Banner */}
        {sub && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{sub}</span>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-600 shadow-xs dark:bg-slate-700 dark:text-slate-300">
                {list.length} {list.length === 1 ? 'tool' : 'tools'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSub(null)}
              className="cursor-pointer text-xs font-semibold text-primary-600 hover:underline dark:text-primary-400"
            >
              ← View all {active ? active.name : 'tools'}
            </button>
          </div>
        )}

        {/* Sub-category filter tabs (strictly for active category) */}
        {subs.length > 0 &&
          ((active?.id !== 'pdf' && active?.id !== 'document-word') || sub !== null || query.trim().length > 0) && (
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSub(null)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                sub === null
                  ? 'border-sky-600 bg-sky-600 text-white shadow-xs'
                  : 'border-slate-300 bg-white text-slate-600 hover:border-sky-400 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              All ({catTools.length})
            </button>
            {subs.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSub(s)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  sub === s
                    ? 'border-sky-600 bg-sky-600 text-white shadow-xs'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-sky-400 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {s} ({subCounts.get(s) ?? 0})
              </button>
            ))}
          </div>
        )}

        {/* When on PDF Hub or Document-Word Hub without subcategory filter or query, render ONLY the folder cards */}
        {(active?.id === 'pdf' || active?.id === 'document-word') && sub === null && !query.trim() ? null : list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
            <p className="font-semibold text-slate-700">No matching tools</p>
            <p className="mt-1 text-sm text-slate-400">Try a different keyword or sub-category.</p>
          </div>
        ) : sub ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </div>
        ) : subs.length > 0 ? (
          <div className="space-y-12">
            {subs.map((s) => {
              const items = filtered.filter((t) => (t.subcategory && subs.includes(t.subcategory) ? t.subcategory : 'Other') === s)
              if (items.length === 0) return null
              return (
                <section key={s}>
                  <h2 className="mb-4 flex items-center gap-3 text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-500" />
                    {s}
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {items.length}
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {items.map((t) => (
                      <ToolCard key={t.id} tool={t} />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}