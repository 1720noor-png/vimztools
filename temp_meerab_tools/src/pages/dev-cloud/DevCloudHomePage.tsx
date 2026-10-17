import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, Terminal } from 'lucide-react'
import Seo from '../../components/ui/Seo'
import CategoryHero from '../../components/ui/CategoryHero'
import CategoryTopSearchBar from '../../components/ui/CategoryTopSearchBar'
import {
  devCloudSubcategories,
  DEV_CLOUD_CATEGORY_NAME,
} from './devCloudConfig'

export default function DevCloudHomePage() {
  const [query, setQuery] = useState('')

  const filteredSubs = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return devCloudSubcategories
    return devCloudSubcategories.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    )
  }, [query])

  const totalTools = useMemo(() => {
    return devCloudSubcategories.reduce((acc, s) => acc + s.toolIds.length, 0)
  }, [])

  return (
    <>
      <Seo
        title={`${DEV_CLOUD_CATEGORY_NAME} — Fast, Private Client-Side Tools`}
        description="Over 40+ client-side developer, cloud, and DevOps engineering utilities. Generate code, size infrastructure, optimize containers, and audit security without servers."
      />

      <div className="min-h-screen pb-20">
        <CategoryHero
          title="Developer Ecosystem, Cloud & DevOps Suite"
          description={`High-performance, private, client-side tools for cloud engineers, developers, and DevOps practitioners. All ${totalTools} utilities run directly in your browser with zero server uploads.`}
          accent={{
            name: DEV_CLOUD_CATEGORY_NAME,
            path: '/dev-cloud',
            icon: Terminal,
            bg: '#ECFEFF',
            bgDark: '#083344',
            accent: '#06B6D4',
          }}
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Link to="/" className="hover:text-cyan-600 dark:hover:text-cyan-400">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Developer & Cloud Suite
            </span>
          </nav>

          {/* Sticky Search Bar */}
          <div className="sticky top-20 z-30 mb-8 bg-white/80 py-2 backdrop-blur-md dark:bg-slate-900/80">
            <CategoryTopSearchBar
              placeholder="Search developer tools, docker, k8s, sql, wasm, cicd..."
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
                  to={`/dev-cloud/${sub.id}`}
                  className="group relative flex flex-col justify-between rounded-2xl border border-cyan-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-lg dark:border-cyan-900/30 dark:bg-slate-800/80 dark:hover:border-cyan-500"
                >
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-cyan-100/70 px-2.5 py-0.5 text-xs font-semibold text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300">
                        {sub.toolIds.length} tools
                      </span>
                    </div>

                    <h3 className="mb-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-cyan-600 dark:text-white dark:group-hover:text-cyan-400">
                      {sub.title}
                    </h3>
                    <p className="mb-3 text-xs font-medium text-cyan-700 dark:text-cyan-300/90">
                      {sub.tagline}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                      {sub.description}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center text-sm font-semibold text-cyan-600 dark:text-cyan-400">
                    <span>Explore folder</span>
                    <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              )
            })}
          </div>

          {filteredSubs.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-base text-slate-500 dark:text-slate-400">
                No developer subcategories matched &quot;{query}&quot;. Try searching for another keyword.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
