import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../../components/ui/Seo'
import CategoryHero from '../../components/ui/CategoryHero'
import { ToolCard } from '../../components/ui/Cards'
import { getCategoryAccent } from '../../lib/categoryAccents'
import CategoryTopSearchBar from '../../components/ui/CategoryTopSearchBar'
import SubcategoryCard from '../../components/ui/SubcategoryCard'
import { householdSubcategories, HOUSEHOLD_TOTAL_TOOLS, HOUSEHOLD_TOOLS } from './householdConfig'
import { getToolById } from '../../lib/catalog'

export default function HouseholdHomePage() {
  const [query, setQuery] = useState('')

  const filteredTools = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return HOUSEHOLD_TOOLS.filter((t) => {
      const matchName = t.name.toLowerCase().includes(q)
      const matchDesc = t.description.toLowerCase().includes(q)
      const matchSub = t.subcategory?.toLowerCase().includes(q)
      const matchKw = t.keywords?.some((k) => k.toLowerCase().includes(q))
      return matchName || matchDesc || matchSub || matchKw
    })
  }, [query])

  return (
    <>
      <Seo
        title="Household - Cleaning, Kitchen, Budget & Home Tools | vimz Tools"
        description={`Browse ${HOUSEHOLD_TOTAL_TOOLS} household tools across cleaning, laundry, kitchen, grocery, budget, gardening, pets, family, moving and safety - all private and browser-based.`}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-3 text-xs font-medium text-slate-400">
          <Link to="/" className="hover:text-primary-600">
            Home
          </Link>
          <span className="mx-1">/</span>
          <span>Household</span>
        </nav>

        <div className="mb-8">
          <CategoryHero
            title="Household"
            description={`Pick a household topic to open its calculators and planning tools. All ${HOUSEHOLD_TOTAL_TOOLS} tools run entirely in your browser for total privacy.`}
            accent={getCategoryAccent('/household')!}
          />
        </div>

        {/* Unified Top Search Bar */}
        <div className="mb-8">
          <CategoryTopSearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search household calculators, planners & guides..."
            categoryName="Household"
            toolCount={query ? filteredTools.length : householdSubcategories.length}
          />
        </div>

        {query ? (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Search Results ({filteredTools.length})
              </h2>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-xs font-semibold text-amber-600 hover:underline dark:text-amber-400 cursor-pointer"
              >
                Clear Search
              </button>
            </div>
            {filteredTools.length === 0 ? (
              <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
                <p className="text-3xl">🔍</p>
                <h3 className="mt-3 text-lg font-bold text-slate-800 dark:text-slate-200">
                  No household tools found
                </h3>
                <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                  No tools matched &ldquo;{query}&rdquo;. Try another search term or browse by category below.
                </p>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="mt-4 inline-flex items-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 cursor-pointer"
                >
                  View all categories
                </button>
              </section>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredTools.map((t, i) => (
                  <div
                    key={t.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <ToolCard tool={t} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {householdSubcategories.map((sub, i) => {
              const count = sub.toolIds.filter((id) => getToolById(id)).length
              return (
                <SubcategoryCard
                  key={sub.id}
                  to={`/household/${sub.id}`}
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