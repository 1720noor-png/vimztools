import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../../components/ui/Seo'
import CategoryHero from '../../components/ui/CategoryHero'
import { getCategoryAccent } from '../../lib/categoryAccents'
import CategoryTopSearchBar from '../../components/ui/CategoryTopSearchBar'
import SubcategoryCard from '../../components/ui/SubcategoryCard'
import { healthSubcategories, HEALTH_TOTAL_TOOLS } from './healthConfig'
import { getToolById } from '../../lib/catalog'

export default function HealthHomePage() {
  const [query, setQuery] = useState('')

  const filteredSubcategories = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return healthSubcategories
    return healthSubcategories.filter((sub) =>
      [sub.title, sub.tagline, sub.description, ...sub.toolIds].join(' ').toLowerCase().includes(q),
    )
  }, [query])

  return (
    <>
      <Seo
        title="Health - BMI, Sleep, Diabetes, Heart & Wellness Tools | vimz Tools"
        description={`Browse ${HEALTH_TOTAL_TOOLS} health tools across weight, nutrition, fitness, heart, sleep, diabetes, mental wellness and more - all private and browser-based.`}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-3 text-xs font-medium text-slate-400">
          <Link to="/" className="hover:text-primary-600">
            Home
          </Link>
          <span className="mx-1">/</span>
          <span>Health</span>
        </nav>

        <div className="mb-8">
          <CategoryHero
            title="Health"
            description={`Pick a health topic to open its calculators and self-tracking tools. All ${HEALTH_TOTAL_TOOLS} tools run entirely in your browser for total privacy.`}
            accent={getCategoryAccent('/health')!}
          />
        </div>

        {/* Unified Top Search Bar */}
        <div className="mb-8">
          <CategoryTopSearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search health calculators, fitness, nutrition, and wellness tools..."
            categoryName="Health"
            toolCount={filteredSubcategories.length}
          />
        </div>

        {filteredSubcategories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="font-semibold text-slate-700 dark:text-slate-300">No matching health categories</p>
            <p className="mt-1 text-xs text-slate-400">Try a different keyword or browse all folders above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredSubcategories.map((sub, i) => {
              const count = sub.toolIds.filter((id) => getToolById(id)).length
              return (
                <SubcategoryCard
                  key={sub.id}
                  to={`/health/${sub.id}`}
                  title={sub.title}
                  count={count}
                  icon={sub.icon}
                  tagline={sub.tagline}
                  description={sub.description}
                  index={i}
                />
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}