import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2, ArrowRight, LayoutGrid } from 'lucide-react'
import Seo from '../../components/ui/Seo'
import NotFoundPage from '../NotFoundPage'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { FolderCard } from '../../components/ui/DataCards'
import { formatTitle } from '../../lib/formatTitle'
import { folderAccent } from '../../lib/folderAccent'
import { useWinCategory, useWinIndex } from '../../lib/winHooks'

export default function CategoryPage() {
  const { category: categorySlug } = useParams<{ category?: string }>()
  const { categories, loading: indexLoading } = useWinIndex()
  const { category, loading, error } = useWinCategory(categorySlug)
  const [filter, setFilter] = useState('')

  if (categorySlug && error) {
    return <NotFoundPage />
  }

  if (categorySlug && loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-primary-600" /> Loading collections…
        </div>
      </div>
    )
  }

  const description = category
    ? `${category.toolCount} tools across ${category.subcategories.length} ${category.subcategories.length === 1 ? 'sub-category' : 'sub-categories'} — every one runs free and 100% in your browser.`
    : 'Free, private, browser-based tools organized into focused collections. Pick a sub-category to start.'

  const displayName = category ? category.name : categorySlug ? formatTitle(categorySlug) : 'Tool Collections'

  const visibleCategories =
    categorySlug && category
      ? [category]
      : categories.filter((c) =>
          filter.trim() ? c.name.toLowerCase().includes(filter.trim().toLowerCase()) : true,
        )

  return (
    <>
      <Seo
        title={
          categorySlug
            ? `${displayName} Tools | vimz Tools`
            : 'Tool Collections | vimz Tools'
        }
        description={description}
      />
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={
            categorySlug
              ? [
                  { label: 'Home', to: '/' },
                  { label: 'Collections', to: '/category' },
                  { label: displayName },
                ]
              : [{ label: 'Home', to: '/' }, { label: 'Collections' }]
          }
        />

        <div className="relative mb-8 overflow-hidden rounded-3xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/90 via-sky-50/40 to-indigo-50/80 p-6 shadow-sm dark:border-indigo-900/40 dark:from-indigo-950/30 dark:via-slate-900/40 dark:to-sky-950/20 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-white/80 px-3 py-1 text-xs font-bold text-indigo-700 shadow-2xs dark:border-indigo-800/80 dark:bg-slate-800/90 dark:text-indigo-300">
                <LayoutGrid className="h-3.5 w-3.5 text-indigo-500" />
                Featured Collections
              </span>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                {categorySlug ? displayName : 'Tool Collections'}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">{description}</p>
            </div>
            {!categorySlug && (
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter categories…"
                className="w-full rounded-xl border border-slate-300/90 bg-white/90 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs backdrop-blur-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 lg:w-64 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            )}
          </div>
        </div>

        {indexLoading && !category && !categorySlug ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin text-primary-600" /> Loading collections…
            </div>
          </div>
        ) : visibleCategories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 py-20 text-center dark:border-slate-800 dark:bg-slate-900/60">
            <p className="font-semibold text-slate-700 dark:text-slate-300">No matching categories</p>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">Try a different keyword.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCategories.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/50 to-indigo-50/20 p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-600/10 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-850 dark:hover:border-indigo-500/50"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${folderAccent[c.id] ?? 'text-primary-600 bg-primary-50 border-primary-200'}`}>
                    <LayoutGrid className="h-3 w-3" />
                    {c.subcategories.length} {c.subcategories.length === 1 ? 'sub-category' : 'sub-categories'}
                  </span>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{c.toolCount} tools</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{c.name}</h2>
                <div className="mt-4 grid gap-3">
                  {c.subcategories.map((s) => (
                    <FolderCard
                      key={s.id}
                      name={s.name}
                      toolCount={s.toolCount}
                      path={`/category/${c.id}/${s.id}`}
                      accentId={c.id}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!categorySlug && !indexLoading && (
          <div className="mt-10 flex justify-center">
            <a
              href="/tools"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-xs transition hover:border-primary-400 hover:text-primary-700 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-200 dark:hover:border-primary-500"
            >
              Explore the featured tool library <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    </>
  )
}