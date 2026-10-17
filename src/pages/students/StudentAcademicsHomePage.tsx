import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../../components/ui/Seo'
import CategoryHero from '../../components/ui/CategoryHero'
import { getCategoryAccent } from '../../lib/categoryAccents'
import CategoryTopSearchBar from '../../components/ui/CategoryTopSearchBar'
import SubcategoryCard from '../../components/ui/SubcategoryCard'
import {
  academicSubcategories,
  academicToolCount,
  STUDENT_ACADEMICS_TOTAL_TOOLS,
} from './studentAcademicsConfig'

export default function StudentAcademicsHomePage() {
  const [query, setQuery] = useState('')

  const filteredSubcategories = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return academicSubcategories
    return academicSubcategories.filter((sub) =>
      [sub.title, sub.tagline, sub.description].join(' ').toLowerCase().includes(q),
    )
  }, [query])

  return (
    <>
      <Seo
        title="Students & Academics - Study, Research, Exams & Finance Tools | vimz Tools"
        description={`Browse ${STUDENT_ACADEMICS_TOTAL_TOOLS} student and academic tools across study planning, writing, research, citations, exams, GPA, career, memory and student finance - all private and browser-based.`}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-3 text-xs font-medium text-slate-400">
          <Link to="/" className="hover:text-primary-600">
            Home
          </Link>
          <span className="mx-1">/</span>
          <span>Students &amp; Academics</span>
        </nav>

        <div className="mb-8">
          <CategoryHero
            title="Students & Academics"
            description={`Choose a focus area to drill into its tools. All ${STUDENT_ACADEMICS_TOTAL_TOOLS} tools run entirely in your browser for total privacy.`}
            accent={getCategoryAccent('/students-academics')!}
          />
        </div>

        {/* Unified Top Search Bar */}
        <div className="mb-8">
          <CategoryTopSearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search academic tools, study planners, citations, and GPA calculators..."
            categoryName="Students & Academics"
            toolCount={filteredSubcategories.length}
          />
        </div>

        {filteredSubcategories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="font-semibold text-slate-700 dark:text-slate-300">No matching academic focus areas</p>
            <p className="mt-1 text-xs text-slate-400">Try a different keyword or browse all areas above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredSubcategories.map((sub, i) => {
              const count = academicToolCount(sub.id)
              return (
                <SubcategoryCard
                  key={sub.id}
                  to={`/students-academics/${sub.id}`}
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
