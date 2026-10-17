import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Search, Loader2 } from 'lucide-react'
import Seo from '../../components/ui/Seo'
import NotFoundPage from '../NotFoundPage'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Pagination from '../../components/ui/Pagination'
import { DataToolCard } from '../../components/ui/DataCards'
import { formatTitle } from '../../lib/formatTitle'
import { useWinCategory, useWinSubcategory } from '../../lib/winHooks'

const PAGE_SIZE = 24

export default function SubcategoryPage() {
  const { category: categorySlug, subcategory: subcategorySlug } = useParams<{
    category: string
    subcategory: string
  }>()
  const { category } = useWinCategory(categorySlug)
  const { meta, tools, loading, error } = useWinSubcategory(categorySlug, subcategorySlug)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

const categoryName = category?.name ?? formatTitle(categorySlug ?? '')
const subcategoryName = meta?.name ?? formatTitle(subcategorySlug ?? '')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tools
    return tools.filter((t) =>
      [t.name, t.purpose, ...t.keywords].join(' ').toLowerCase().includes(q),
    )
  }, [tools, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  )

  if (error) {
    return <NotFoundPage />
  }

  return (
    <>
      <Seo
        title={`${subcategoryName} - ${categoryName} Tools | vimz Tools`}
        description={
          meta
            ? `Browse ${meta.toolCount} free ${categoryName.toLowerCase()} tools, every one running 100% in your browser. No sign-ups, no uploads.`
            : `Free browser-based ${categoryName.toLowerCase()} tools at vimz Tools.`
        }
      />
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Collections', to: '/category' },
            { label: categoryName, to: `/category/${categorySlug}` },
            { label: subcategoryName },
          ]}
        />

        <div className="relative mb-8 overflow-hidden rounded-3xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/90 via-sky-50/40 to-indigo-50/80 p-6 shadow-sm dark:border-indigo-900/40 dark:from-indigo-950/30 dark:via-slate-900/40 dark:to-sky-950/20 sm:p-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-white/80 px-3 py-1 text-xs font-bold text-indigo-700 shadow-2xs dark:border-indigo-800/80 dark:bg-slate-800/90 dark:text-indigo-300">
              {categoryName} Collection
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {loading ? 'Loading…' : subcategoryName}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
              {loading
                ? 'Preparing your tools…'
                : meta
                  ? `${meta.toolCount} free ${categoryName.toLowerCase()} tools organized here. Search below or page through the full list — everything runs privately in your browser.`
                  : `Free browser-based ${categoryName.toLowerCase()} tools, instantly searchable and always private.`}
            </p>
          </div>
        </div>

        <div className="relative mb-6 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder={`Search ${subcategoryName.toLowerCase()} tools…`}
            className="w-full rounded-xl border border-slate-300/90 bg-white/90 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs backdrop-blur-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>

        <p className="mb-4 text-xs font-medium text-slate-400 dark:text-slate-500">
          {loading ? '…' : `${filtered.length} ${filtered.length === 1 ? 'tool' : 'tools'}`}
          {query.trim() && !loading ? ` for “${query.trim()}”` : ''}
        </p>

        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin text-primary-600" /> Loading tools…
            </div>
          </div>
        ) : pageItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 py-20 text-center dark:border-slate-800 dark:bg-slate-900/60">
            <p className="font-semibold text-slate-700 dark:text-slate-300">No matching tools</p>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">Try a different keyword.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {pageItems.map((t) => (
                <DataToolCard
                  key={t.id}
                  name={t.name}
                  description={t.purpose}
                  category={t.categoryName}
                  path={t.path}
                />
              ))}
            </div>
            <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>
    </>
  )
}