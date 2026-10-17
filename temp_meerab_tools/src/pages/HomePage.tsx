import type { CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight } from 'lucide-react'
import Seo from '../components/ui/Seo'
import ToolSearchBar from '../components/ui/ToolSearchBar'
import { exactCategories } from '../lib/categoryAccents'
import type { ExactCategory } from '../lib/categoryAccents'

const CATEGORY_TOOL_COUNTS: Record<string, string> = {
  '/health': '224+ tools',
  '/household': '60+ tools',
  '/image-tools': '233 tools',
  '/students-academics': '337 tools',
  '/marketers-seo': '226 tools',
  '/office-corporate': '600 tools',
  '/tools/pdf': '110+ tools',
  '/tools/document-word': '105 tools',
  '/ai-tools': '62 tools',
  '/dev-cloud': '42 tools',
  '/cyber-security': '29 tools',
  '/green-energy': '24 tools',
  '/fintech-venture': '21 tools',
  '/civic-lifestyle': '20 tools',
}

function CategoryCardItem({ cat }: { cat: ExactCategory }) {
  const navigate = useNavigate()

  return (
    <div
      className="cat-card group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 md:p-6 cursor-pointer"
      style={
        {
          '--cat-bg': cat.bg,
          '--cat-bg-dark': cat.bgDark,
          '--cat-accent': cat.accent,
        } as CSSProperties
      }
      onClick={() => navigate(cat.path)}
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          navigate(cat.path)
        }}
        className="relative flex w-full flex-col items-start text-left cursor-pointer"
      >
        <div className="flex w-full items-center justify-between">
          <span className="cat-icon-tile flex h-12 w-12 items-center justify-center rounded-xl border shadow-2xs transition-transform duration-200 group-hover:scale-105">
            <cat.icon className="h-6 w-6" strokeWidth={2.2} />
          </span>
          <span className="cat-count-badge rounded-full border px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-200 shadow-2xs">
            {CATEGORY_TOOL_COUNTS[cat.path] || 'Tools'}
          </span>
        </div>
        <h3 className="mt-4 text-base font-bold tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-slate-950 dark:text-slate-100 dark:group-hover:text-white">
          {cat.name}
        </h3>
        <span
          className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all duration-200 group-hover:gap-2 group-hover:shadow-md group-hover:brightness-105"
          style={{ backgroundColor: cat.accent }}
        >
          Explore <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </button>
    </div>
  )
}

export default function HomePage() {
  return (
    <>
      <Seo
        title="vimz.ai - Every Tool You Need, Right in Your Browser"
        description="Free, private, browser-based utilities for PDF, image processing, academics, health, household, and marketing. 100% client-side processing - your files are never uploaded."
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(157,56,138,0.16),transparent_60%)]" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Sleek Minimalist Tagline */}
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/90 px-4 py-1.5 text-xs font-semibold text-sky-800 shadow-sm backdrop-blur-sm dark:border-sky-800/80 dark:bg-slate-800/90 dark:text-sky-300">
              <Sparkles className="h-3.5 w-3.5 text-sky-500" />
              Client-Side Privacy · Zero Uploads · Instant Browser Processing
            </span>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 leading-[1.18] sm:text-5xl sm:leading-[1.15] lg:text-6xl lg:leading-[1.15] dark:text-white">
              Every tool you need,
              <span className="block pb-2 pt-0.5 bg-gradient-to-r from-[#9D388A] to-[#6D28D9] bg-clip-text text-transparent">
                right in your browser
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-500 sm:text-lg dark:text-slate-400">
              An all-in-one suite of fast, secure, browser-based utilities open and
              accessible for everyone.
            </p>
            <div className="mt-10 animate-rise">
              <ToolSearchBar />
            </div>
            <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
              Press <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">Ctrl</kbd>{' '}
              +{' '}
              <kbd className="rounded border border-slate-300 bg-white px-1.5 py-0.5 font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">K</kbd>{' '}
              to search from anywhere
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
              <Link
                to="/register"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 via-[#9D388A] to-indigo-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-primary-500/25 transition-all duration-200 hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary-500/35 hover:brightness-110 active:scale-[0.98] sm:w-auto"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/tools"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white/80 px-6 py-3.5 text-sm font-semibold text-slate-700 backdrop-blur-sm transition-all duration-200 hover:border-primary-400 hover:bg-white hover:text-primary-700 sm:w-auto dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:border-primary-500"
              >
                Browse All Tools
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tier 1: Main Category Cards (3-Tier Drill-Down) */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-12 pb-20 sm:pb-24">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Browse by category
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Pick a category to open its dedicated workspace and explore its tools.
            </p>
          </div>
          <Link
            to="/tools"
            className="hidden items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 sm:flex dark:text-primary-400"
          >
            All tools <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {exactCategories.map((cat) => (
            <CategoryCardItem key={cat.name} cat={cat} />
          ))}
        </div>
      </section>

    </>
  )
}