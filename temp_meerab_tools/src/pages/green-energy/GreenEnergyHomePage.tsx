import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, Leaf } from 'lucide-react'
import Seo from '../../components/ui/Seo'
import CategoryHero from '../../components/ui/CategoryHero'
import CategoryTopSearchBar from '../../components/ui/CategoryTopSearchBar'
import {
  greenSubcategories,
  GREEN_ENERGY_CATEGORY_NAME,
} from './greenEnergyConfig'

export default function GreenEnergyHomePage() {
  const [query, setQuery] = useState('')

  const filteredSubs = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return greenSubcategories
    return greenSubcategories.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    )
  }, [query])

  const totalTools = useMemo(() => {
    return greenSubcategories.reduce((acc, s) => acc + s.toolIds.length, 0)
  }, [])

  return (
    <>
      <Seo
        title={`${GREEN_ENERGY_CATEGORY_NAME} — Fast, Private Clean Tech Tools`}
        description="Comprehensive solar PV sizing, BESS battery degradation, heat pump COP, micro-hydro, green hydrogen, and carbon accounting calculators. 100% private in-browser analysis."
      />

      <div className="min-h-screen pb-20">
        <CategoryHero
          title="Sustainable Energy & Climate Tech Suite"
          description={`High-precision, client-side engineering and carbon calculators for renewable energy developers, energy auditors, and sustainability directors. All ${totalTools} utilities execute strictly in-browser without sending facility data to any remote server.`}
          accent={{
            name: GREEN_ENERGY_CATEGORY_NAME,
            path: '/green-energy',
            icon: Leaf,
            bg: '#F0FDF4',
            bgDark: '#052e16',
            accent: '#16A34A',
          }}
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Link to="/" className="hover:text-emerald-600 dark:hover:text-emerald-400">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Clean Energy &amp; Climate Suite
            </span>
          </nav>

          {/* Sticky Search Bar */}
          <div className="sticky top-20 z-30 mb-8 bg-white/80 py-2 backdrop-blur-md dark:bg-slate-900/80">
            <CategoryTopSearchBar
              placeholder="Search solar, battery storage, heat pumps, wind, scope 1-2-3 carbon, green hydrogen, off-grid..."
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
                  to={`/green-energy/${sub.id}`}
                  className="group relative flex flex-col justify-between rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400 hover:shadow-lg dark:border-emerald-900/30 dark:bg-slate-800/80 dark:hover:border-emerald-500"
                >
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-emerald-100/70 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                        {sub.toolIds.length} tools
                      </span>
                    </div>

                    <h3 className="mb-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                      {sub.title}
                    </h3>
                    <p className="mb-3 text-xs font-medium text-emerald-700 dark:text-emerald-300/90">
                      {sub.tagline}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                      {sub.description}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 transition-all group-hover:gap-2.5 dark:text-emerald-400">
                    <span>Explore Tools</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              )
            })}
          </div>

          {filteredSubs.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-lg text-slate-500 dark:text-slate-400">
                No clean energy tools matching &quot;{query}&quot;
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
