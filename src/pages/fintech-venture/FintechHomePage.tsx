import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, TrendingUp } from 'lucide-react'
import Seo from '../../components/ui/Seo'
import CategoryHero from '../../components/ui/CategoryHero'
import CategoryTopSearchBar from '../../components/ui/CategoryTopSearchBar'
import {
  fintechSubcategories,
  FINTECH_CATEGORY_NAME,
} from './fintechConfig'

export default function FintechHomePage() {
  const [query, setQuery] = useState('')

  const filteredSubs = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return fintechSubcategories
    return fintechSubcategories.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    )
  }, [query])

  const totalTools = useMemo(() => {
    return fintechSubcategories.reduce((acc, s) => acc + s.toolIds.length, 0)
  }, [])

  return (
    <>
      <Seo
        title={`${FINTECH_CATEGORY_NAME} — Fast, Private Financial Engineering Tools`}
        description="Institutional startup runway sizers, SAFE dilution modelers, SaaS unit economics, DCF valuations, Black-Scholes Greeks, and LBO returns. 100% private in-browser analysis."
      />

      <div className="min-h-screen pb-20">
        <CategoryHero
          title="Fintech & Venture Economics Suite"
          description={`Institutional-grade, client-side financial engineering models for startup founders, CFOs, quantitative analysts, and venture investors. All ${totalTools} utilities execute strictly in-browser without transmitting cap tables or revenue data to any external server.`}
          accent={{
            name: FINTECH_CATEGORY_NAME,
            path: '/fintech-venture',
            icon: TrendingUp,
            bg: '#F0FDF4',
            bgDark: '#022c22',
            accent: '#0D9488',
          }}
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Link to="/" className="hover:text-teal-600 dark:hover:text-teal-400">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Fintech &amp; Venture Economics
            </span>
          </nav>

          {/* Sticky Search Bar */}
          <div className="sticky top-20 z-30 mb-8 bg-white/80 py-2 backdrop-blur-md dark:bg-slate-900/80">
            <CategoryTopSearchBar
              placeholder="Search runway, cap table, SAFE, SaaS LTV/CAC, DCF, Black-Scholes, LBO, bonds, AMM..."
              value={query}
              onChange={setQuery}
            />
          </div>

          {/* 20 Subcategory Cards Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredSubs.map((sub) => {
              const Icon = sub.icon
              return (
                <Link
                  key={sub.id}
                  to={`/fintech-venture/${sub.id}`}
                  className="group relative flex flex-col justify-between rounded-2xl border border-teal-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-400 hover:shadow-lg dark:border-teal-900/30 dark:bg-slate-800/80 dark:hover:border-teal-500"
                >
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-teal-100/70 px-2.5 py-0.5 text-xs font-semibold text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
                        {sub.toolIds.length} tools
                      </span>
                    </div>

                    <h3 className="mb-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-400">
                      {sub.title}
                    </h3>
                    <p className="mb-3 text-xs font-medium text-teal-700 dark:text-teal-300/90">
                      {sub.tagline}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                      {sub.description}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-teal-700 transition-all group-hover:gap-2.5 dark:text-teal-400">
                    <span>Model Economics</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              )
            })}
          </div>

          {filteredSubs.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-lg text-slate-500 dark:text-slate-400">
                No financial tools matching &quot;{query}&quot;
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
