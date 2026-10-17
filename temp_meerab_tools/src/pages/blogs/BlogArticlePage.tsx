import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { ArrowLeft, Clock, Tag, Sparkles, ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react'
import Seo from '../../components/ui/Seo'
import BlogThumbnailBanner from '../../components/blogs/BlogThumbnailBanner'
import { getBlog, getRelatedBlogs } from '../../lib/blogs'
import type { Blog } from '../../lib/blogs'
import { apiToLocalBlog, getApiBlog, toEditorialBlog, type ApiBlog } from '../../lib/api'

function renderBlock(block: Blog['content'][number], i: number) {
  switch (block.type) {
    case 'h2':
      return (
        <h2 key={i} className="mt-10 mb-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {block.text}
        </h2>
      )
    case 'h3':
      return (
        <h3 key={i} className="mt-8 mb-2 text-lg font-bold text-slate-900 dark:text-slate-100">
          {block.text}
        </h3>
      )
    case 'p':
      return (
        <p key={i} className="mt-4 text-[15px] sm:text-base leading-7 text-slate-700 dark:text-slate-300">
          {block.text}
        </p>
      )
    case 'ul':
      return (
        <ul key={i} className="mt-4 space-y-2.5 text-[15px] sm:text-base leading-7 text-slate-700 dark:text-slate-300">
          {block.items?.map((item, j) => (
            <li key={j} className="flex gap-3">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )
    case 'ol':
      return (
        <ol key={i} className="mt-4 space-y-2.5 text-[15px] sm:text-base leading-7 text-slate-700 dark:text-slate-300">
          {block.items?.map((item, j) => (
            <li key={j} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-800 dark:bg-primary-950/80 dark:text-primary-300">
                {j + 1}
              </span>
              <span className="pt-0.5">{item}</span>
            </li>
          ))}
        </ol>
      )
    case 'quote':
      return (
        <blockquote
          key={i}
          className="mt-6 rounded-r-2xl border-l-4 border-primary-500 bg-primary-50/70 px-5 py-4 font-mono text-[13px] sm:text-sm leading-relaxed text-primary-950 dark:border-primary-500 dark:bg-primary-950/30 dark:text-primary-200"
        >
          {block.text}
        </blockquote>
      )
    case 'tip':
      return (
        <div
          key={i}
          className="mt-6 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-5 py-4 dark:border-emerald-900/40 dark:bg-emerald-950/30"
        >
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm leading-6 text-emerald-900 dark:text-emerald-200">{block.text}</p>
        </div>
      )
    case 'warning':
      return (
        <div
          key={i}
          className="mt-6 flex gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 px-5 py-4 dark:border-rose-900/40 dark:bg-rose-950/30"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <p className="text-sm leading-6 text-rose-900 dark:text-rose-200">{block.text}</p>
        </div>
      )
    default:
      return null
  }
}

export default function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const s = slug ?? ''
  const fallback = useMemo(() => getBlog(s), [s])
  const [apiBlog, setApiBlog] = useState<ApiBlog | null | undefined>(undefined)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let mounted = true
    getApiBlog(s)
      .then((api) => {
        if (!mounted) return
        if (api) setApiBlog(api)
        else if (!fallback) setNotFound(true)
      })
      .catch(() => {
        if (!fallback) setNotFound(true)
      })
    return () => {
      mounted = false
    }
  }, [s, fallback])

  const blog: Blog | null | undefined = fallback
    ? apiBlog
      ? toEditorialBlog(apiBlog, fallback)
      : fallback
    : notFound
      ? null
      : apiBlog
        ? apiToLocalBlog(apiBlog)
        : undefined

  if (blog === undefined) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading technical article…</p>
      </div>
    )
  }

  if (blog === null) {
    return <Navigate to="/blogs" replace />
  }

  const related = getRelatedBlogs(blog.slug, 3)
  const published = new Date(blog.date)
  const hasRelatedTool = Boolean(blog.relatedTool?.name && blog.relatedTool?.path)

  return (
    <>
      <Seo title={`${blog.title} | vimz Tools Blog`} description={blog.excerpt} />
      <article className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary-600 transition hover:text-primary-700 dark:text-primary-400"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Blogs
          </Link>

          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-full px-2.5 py-0.5 dark:bg-emerald-950/60 dark:border-emerald-900/40 dark:text-emerald-300">
            <ShieldCheck className="h-3 w-3" /> Client-Side Verified
          </span>
        </div>

        {/* Article Header */}
        <header>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-bold text-primary-800 dark:border-primary-900/50 dark:bg-primary-950/60 dark:text-primary-300">
              {blog.category}
            </span>
            {(blog.tags || []).slice(0, 4).map((t) => (
              <span
                key={t}
                className="flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-300"
              >
                <Tag className="h-3 w-3 text-primary-500" /> {t}
              </span>
            ))}
          </div>

          <h1 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-3xl md:text-4xl">
            {blog.title}
          </h1>

          <p className="mt-3 text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            {blog.excerpt}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-slate-200/80 py-4 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-indigo-700 text-xs font-bold text-white shadow-xs">
                {blog.author
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('')}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{blog.author}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{blog.authorRole}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <Clock className="h-4 w-4" />
              <span>
                {published.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}{' '}
                · {blog.readingMinutes} min read
              </span>
            </div>
          </div>
        </header>

        {/* Chrome for Developers Visual Banner Container */}
        <div className="mt-8 overflow-hidden rounded-2xl shadow-sm">
          <BlogThumbnailBanner
            title={blog.title}
            category={blog.category}
            readingMinutes={blog.readingMinutes}
            badge={blog.badge}
            theme={blog.theme}
            size="lg"
            className="h-60 sm:h-72"
          />
        </div>

        {/* Article Body Content */}
        <div className="mt-8">{blog.content.map(renderBlock)}</div>

        {/* Matching In-Browser Tool CTA */}
        {hasRelatedTool && blog.relatedTool && (
          <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-700 p-6 sm:p-7 shadow-lg shadow-primary-600/20 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary-200">
                Try this tool in your browser
              </p>
              <h3 className="mt-1 text-lg sm:text-xl font-bold text-white">{blog.relatedTool.name}</h3>
              <p className="mt-1 text-xs sm:text-sm text-primary-100">
                100% private, client-side execution. Zero uploads, zero server storage.
              </p>
            </div>
            <Link
              to={blog.relatedTool.path}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs sm:text-sm font-bold text-primary-900 shadow-sm transition hover:bg-primary-50"
            >
              Launch Tool <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Author Card */}
        <div className="mt-12 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-indigo-700 text-base font-bold text-white shadow-xs">
              {blog.author
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('')}
            </span>
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">{blog.author}</p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {blog.authorRole} · vimz Browser Architecture Team
              </p>
            </div>
          </div>
        </div>

        {/* More Articles to Read */}
        {related.length > 0 && (
          <div className="mt-14 border-t border-slate-200/80 pt-10 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Related Technical Articles</h2>
              <Link to="/blogs" className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
                View all articles →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/blog/${r.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary-400 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-primary-500/50"
                >
                  <BlogThumbnailBanner
                    title={r.title}
                    category={r.category}
                    readingMinutes={r.readingMinutes}
                    badge={r.badge}
                    theme={r.theme}
                    className="h-32"
                  />
                  <div className="flex flex-1 flex-col p-4">
                    <p className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-primary-600 dark:text-slate-100 dark:group-hover:text-primary-400">
                      {r.title}
                    </p>
                    <div className="mt-auto pt-3 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                      <span>{r.author}</span>
                      <span>{r.readingMinutes} min read</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  )
}