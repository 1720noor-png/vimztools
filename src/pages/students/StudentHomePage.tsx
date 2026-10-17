import { Link } from 'react-router-dom'
import { ArrowRight, GraduationCap } from 'lucide-react'
import Seo from '../../components/ui/Seo'
import CategoryHero from '../../components/ui/CategoryHero'
import { getCategoryAccent } from '../../lib/categoryAccents'
import { studentMainCategories, studentMainToolCount } from './studentConfig'
import {
  STUDENT_ACADEMICS_TOTAL_FOLDERS,
  STUDENT_ACADEMICS_TOTAL_TOOLS,
} from './studentAcademicsConfig'

export default function StudentHomePage() {
  return (
    <>
      <Seo
        title="Student Tools - PDF, Study, Writing & Image Utilities | vimz Tools"
        description={`Browse ${studentMainToolCount('pdf') + studentMainToolCount('digital') + studentMainToolCount('image')} student-focused tools across PDF utilities, digital converters and image tools - all private and browser-based.`}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-3 text-xs font-medium text-slate-400">
          <Link to="/" className="hover:text-primary-600">
            Home
          </Link>
          <span className="mx-1">/</span>
          <span>Student Tools</span>
        </nav>

        <div className="mb-8">
          <CategoryHero
            title="Student Tools"
            description={`Choose a main category to drill into its sub-categories and tools. All ${
              studentMainToolCount('pdf') + studentMainToolCount('digital') + studentMainToolCount('image')
            } tools run entirely in your browser for total privacy.`}
            accent={getCategoryAccent('/students')!}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {studentMainCategories.map((main, i) => {
            const count = studentMainToolCount(main.id)
            const Icon = main.icon
            return (
              <Link
                key={main.id}
                to={`/students/${main.id}`}
                className="animate-fade-up group flex flex-col rounded-2xl border border-indigo-100/90 bg-gradient-to-br from-white via-indigo-50/30 to-blue-50/20 p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 dark:border-indigo-950/40 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/20 dark:hover:border-indigo-500/50"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border shadow-xs transition-transform duration-200 group-hover:scale-105 ${main.accent}`}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="rounded-full border border-indigo-100 bg-indigo-50/80 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-300">
                    {count} {count === 1 ? 'tool' : 'tools'}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 transition-colors group-hover:text-indigo-700 dark:text-slate-100 dark:group-hover:text-indigo-300">
                  {main.title}
                </h3>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-indigo-500/80 dark:text-indigo-400/80">
                  {main.tagline}
                </p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {main.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                    {main.subcategories.length}{' '}
                    {main.subcategories.length === 1 ? 'category' : 'categories'}
                  </span>
                  <span className="flex items-center gap-1 text-sm font-bold text-indigo-600 transition group-hover:gap-2 dark:text-indigo-400">
                    Explore <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-8">
          <Link
            to="/students-academics"
            className="group flex flex-col gap-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6 transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-600/5 sm:flex-row sm:items-center sm:justify-between dark:border-indigo-900/40 dark:bg-indigo-950/20"
          >
            <div className="flex items-start gap-4">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-200 bg-white text-indigo-600 dark:border-indigo-900/60 dark:bg-slate-900 dark:text-indigo-300">
                <GraduationCap className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">Students &amp; Academics</h3>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Study planning, writing, research, exams &amp; student finance
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {STUDENT_ACADEMICS_TOTAL_TOOLS} deeper academic calculators and planners
                  across {STUDENT_ACADEMICS_TOTAL_FOLDERS} folders, from citation formatters
                  and GPA projections to spaced revision and student loan planning.
                </p>
              </div>
            </div>
            <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-indigo-600 transition group-hover:gap-2">
              Explore {STUDENT_ACADEMICS_TOTAL_TOOLS} tools <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </>
  )
}