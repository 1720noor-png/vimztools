import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PenLine, ArrowRight, Search, ChevronLeft, ChevronRight, X, Sparkles, BookOpen } from 'lucide-react'
import Seo from '../../components/ui/Seo'
import CategoryHero from '../../components/ui/CategoryHero'
import BlogThumbnailBanner from '../../components/blogs/BlogThumbnailBanner'
import { getCategoryAccent } from '../../lib/categoryAccents'
import { blogs, getSubmittedBlogs } from '../../lib/blogs'
import { blogCategories } from '../../lib/blogsData'
import { apiToLocalBlog, getApiBlogs, toEditorialBlog, type ApiBlog } from '../../lib/api'

const ITEMS_PER_PAGE = 12

export default function BlogListPage() {
  const [active, setActive] = useState('All')
  const [query, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [apiBlogs, setApiBlogs] = useState<ApiBlog[]>([])

  useEffect(() => {
    let mounted = true
    getApiBlogs()
      .then((list) => {
        if (mounted) setApiBlogs(list)
      })
      .catch(() => {
        /* fall back to static */
      })
    return () => {
      mounted = false
    }
  }, [])

  const submitted = useMemo(() => getSubmittedBlogs(), [])

  const allBlogs = useMemo(() => {
    const map = new Map(blogs.map((b) => [b.slug, b]))
    const merged = [...blogs]
    for (const api of apiBlogs) {
      const existing = map.get(api.slug)
      if (existing) {
        const idx = merged.findIndex((b) => b.slug === api.slug)
        if (idx >= 0) merged[idx] = toEditorialBlog(api, existing)
      } else {
        merged.push(apiToLocalBlog(api))
      }
    }
    return merged
  }, [apiBlogs])

  const filtered = useMemo(() => {
    let list = allBlogs
    if (active !== 'All') list = list.filter((b) => b.category === active)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((b) =>
        [b.title, b.category, b.excerpt, b.author, ...(b.tags || [])].join(' ').toLowerCase().includes(q),
      )
    }
    return list
  }, [active, query, allBlogs])

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [active, query])

  const totalArticles = filtered.length
  const totalPages = Math.ceil(totalArticles / ITEMS_PER_PAGE) || 1

  const paginatedBlogs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filtered, currentPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    const element = document.getElementById('articles-grid-anchor')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allBlogs.length }
    for (const b of allBlogs) {
      counts[b.category] = (counts[b.category] || 0) + 1
    }
    return counts
  }, [allBlogs])

  const startCount = (currentPage - 1) * ITEMS_PER_PAGE + 1
  const endCount = Math.min(currentPage * ITEMS_PER_PAGE, totalArticles)

  return (
    <>
      <Seo
        title="Engineering & Architecture Blog | vimz Tools"
        description="Over 100 deep-dive technical articles on browser-native computing, WebAssembly SIMD, WebGPU, zero-upload privacy, PDF internals, and modern developer utilities."
      />
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <CategoryHero
          title="Engineering & Browser Utilities Blog"
          description="Insights, benchmarks, and deep-dive technical guides on client-side WebAssembly, WebGPU, zero-upload privacy architecture, and practical document workflows."
          accent={getCategoryAccent('/blogs')!}
          action={
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/blogs/submit"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm shadow-primary-600/25 transition hover:bg-primary-700"
              >
                <PenLine className="h-4 w-4" /> Submit an Article
              </Link>
            </div>
          }
        />

        {/* Community Drafts (if any exist) */}
        {submitted.length > 0 && (
          <div className="mb-8 mt-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Community Drafts (Local Session)
              </h2>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {submitted.slice(0, 3).map((b) => (
                <div
                  key={b.id}
                  className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/50 p-5 dark:border-amber-900/60 dark:bg-amber-950/20"
                >
                  <span className="inline-block rounded-md bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                    Draft Pending Review
                  </span>
                  <h3 className="mt-2 font-bold text-slate-800 dark:text-slate-200">{b.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{b.excerpt}</p>
                  <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500">
                    By {b.author} · {b.category}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Category Filter Bar */}
        <div id="articles-grid-anchor" className="mt-8 mb-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search 100+ articles by keyword, tag, or topic..."
                className="w-full rounded-xl border border-slate-200/90 bg-white py-2.5 pl-10 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-primary-950/50"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <BookOpen className="h-4 w-4 text-primary-500" />
              <span>
                {totalArticles > 0 ? (
                  <>
                    Showing <span className="text-slate-900 dark:text-slate-100 font-bold">{startCount}–{endCount}</span> of{' '}
                    <span className="text-slate-900 dark:text-slate-100 font-bold">{totalArticles}</span> articles
                  </>
                ) : (
                  '0 articles found'
                )}
              </span>
            </div>
          </div>

          {/* Category Pill Tabs (Chrome for Developers Inspired) */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 border-b border-slate-200/60 pb-4 dark:border-slate-800">
            <button
              onClick={() => setActive('All')}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                active === 'All'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-850 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              All Topics
              <span
                className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
                  active === 'All' ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-750 dark:text-slate-300'
                }`}
              >
                {categoryCounts.All || 0}
              </span>
            </button>

            {blogCategories.map((c) => {
              const count = categoryCounts[c] || 0
              const isActive = active === c
              return (
                <button
                  key={c}
                  onClick={() => setActive(c)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-850 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                >
                  {c}
                  <span
                    className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] ${
                      isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-750 dark:text-slate-300'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Empty State */}
        {totalArticles === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/40 py-20 text-center dark:border-slate-800 dark:bg-slate-900/40">
            <Search className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
            <p className="mt-3 text-base font-bold text-slate-800 dark:text-slate-200">
              No matching articles found
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Try searching with another keyword or selecting "All Topics".
            </p>
            <button
              onClick={() => {
                setActive('All')
                setQuery('')
              }}
              className="mt-4 inline-flex items-center rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Responsive 3-Column Chrome for Developers Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {paginatedBlogs.map((b) => {
              const formattedDate = new Date(b.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })

              return (
                <Link
                  key={b.slug}
                  to={`/blog/${b.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary-400 hover:shadow-xl hover:shadow-primary-500/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-primary-500/50 dark:hover:shadow-2xl dark:hover:shadow-primary-950/40"
                >
                  {/* Chrome for Developers Visual Banner Header */}
                  <BlogThumbnailBanner
                    title={b.title}
                    category={b.category}
                    readingMinutes={b.readingMinutes}
                    badge={b.badge}
                    theme={b.theme}
                    className="h-44 group-hover:brightness-105"
                  />

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    {/* Tags Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                      {(b.tags || []).slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Post Title */}
                    <h3 className="line-clamp-2 text-base sm:text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-primary-600 dark:text-slate-100 dark:group-hover:text-primary-400">
                      {b.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="mt-2.5 line-clamp-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {b.excerpt}
                    </p>

                    {/* Card Footer */}
                    <div className="mt-auto pt-5">
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/80">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {b.author}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">
                            {formattedDate}
                          </p>
                        </div>

                        <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 transition group-hover:text-primary-700 dark:text-primary-400 dark:group-hover:text-primary-300">
                          Read
                          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Clean Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-6 sm:flex-row dark:border-slate-800">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Page <span className="font-bold text-slate-900 dark:text-slate-100">{currentPage}</span> of{' '}
              <span className="font-bold text-slate-900 dark:text-slate-100">{totalPages}</span>
            </p>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>

              {/* Numbered Page Buttons with Smart Ellipsis */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    if (totalPages <= 7) return true
                    if (page === 1 || page === totalPages) return true
                    if (Math.abs(page - currentPage) <= 1) return true
                    return false
                  })
                  .reduce<(number | string)[]>((acc, page, idx, src) => {
                    if (idx > 0 && typeof src[idx - 1] === 'number') {
                      const prev = src[idx - 1] as number
                      if (page - prev > 1) {
                        acc.push('...')
                      }
                    }
                    acc.push(page)
                    return acc
                  }, [])
                  .map((item, idx) => {
                    if (typeof item === 'string') {
                      return (
                        <span key={`dots-${idx}`} className="px-2 text-xs text-slate-400">
                          ...
                        </span>
                      )
                    }

                    const pageNum = item as number
                    const isSelected = pageNum === currentPage

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`h-8 w-8 rounded-xl text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-primary-600 text-white shadow-xs'
                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}