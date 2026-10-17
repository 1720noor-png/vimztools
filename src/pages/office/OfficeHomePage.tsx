import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../../components/ui/Seo'
import CategoryHero from '../../components/ui/CategoryHero'
import { getCategoryAccent } from '../../lib/categoryAccents'
import CategoryTopSearchBar from '../../components/ui/CategoryTopSearchBar'
import SubcategoryCard from '../../components/ui/SubcategoryCard'
import {
  officeModules,
  moduleToolCount,
  OFFICE_TOTAL_TOOLS,
} from './officeConfig'

export default function OfficeHomePage() {
  const [query, setQuery] = useState('')

  const filteredModules = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return officeModules
    return officeModules.filter((module) =>
      [module.name, module.description, ...module.subcategories.map((s) => s.name)].join(' ').toLowerCase().includes(q),
    )
  }, [query])

  return (
    <>
      <Seo
        title="Office & Corporate Utilities - HR, Strategy, Finance, Logistics Tools | vimz Tools"
        description={`Browse ${OFFICE_TOTAL_TOOLS} corporate tools across HR & People, Strategy & Executive, Finance & Procurement, and Logistics & Operations - all private and browser-based.`}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-3 text-xs font-medium text-slate-400">
          <Link to="/" className="hover:text-primary-600">
            Home
          </Link>
          <span className="mx-1">/</span>
          <span>Office &amp; Corporate Utilities</span>
        </nav>

        <div className="mb-8">
          <CategoryHero
            title="Office & Corporate Utilities"
            description={`Pick a module to drill into its sub-categories and tools. All ${OFFICE_TOTAL_TOOLS} tools run entirely in your browser for total privacy.`}
            accent={getCategoryAccent('/office-corporate')!}
          />
        </div>

        {/* Unified Top Search Bar */}
        <div className="mb-8">
          <CategoryTopSearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search corporate modules, HR, strategy, finance & logistics tools..."
            categoryName="Office & Corporate"
            toolCount={filteredModules.length}
          />
        </div>

        {filteredModules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="font-semibold text-slate-700 dark:text-slate-300">No matching corporate modules</p>
            <p className="mt-1 text-xs text-slate-400">Try searching for HR, finance, strategy, or operations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredModules.map((module, i) => {
              const count = moduleToolCount(module.id)
              return (
                <SubcategoryCard
                  key={module.id}
                  to={`/office-corporate/${module.id}`}
                  title={module.name}
                  count={count}
                  icon={module.icon}
                  description={module.description}
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