import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Seo from '../../components/ui/Seo'
import {
  findStudentMain,
  studentToolsFor,
} from './studentConfig'

export default function StudentCategoryPage() {
  const { mainCategory } = useParams<{ mainCategory: string }>()
  const main = mainCategory ? findStudentMain(mainCategory) : undefined

  if (!main) return <Navigate to="/students" replace />

  const Icon = main.icon

  return (
    <>
      <Seo
        title={`${main.title} - Student Categories | vimz Tools`}
        description={`${main.title} for students - ${main.description}`}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-3 text-xs font-medium text-slate-400">
          <Link to="/" className="hover:text-primary-600">
            Home
          </Link>
          <span className="mx-1">/</span>
          <Link to="/students" className="hover:text-primary-600">
            Student Tools
          </Link>
          <span className="mx-1">/</span>
          <span>{main.title}</span>
        </nav>

        <div className="relative mb-8 overflow-hidden rounded-3xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/90 via-sky-50/40 to-indigo-50/80 p-6 shadow-sm dark:border-indigo-900/40 dark:from-indigo-950/30 dark:via-slate-900/40 dark:to-sky-950/20 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-sm ${main.accent}`}
              >
                <Icon className="h-7 w-7" />
              </span>
              <div>
                <span className="inline-flex items-center rounded-full border border-indigo-200 bg-white/80 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 shadow-2xs dark:border-indigo-800/80 dark:bg-slate-800/90 dark:text-indigo-300">
                  Student Tools
                </span>
                <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                  {main.title}
                </h1>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-indigo-500/80 dark:text-indigo-400/80">
                  {main.tagline}
                </p>
              </div>
            </div>
            <Link
              to="/students"
              className="flex items-center gap-1.5 rounded-xl border border-slate-300/90 bg-white/90 px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-xs backdrop-blur-sm transition hover:border-indigo-400 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-200 dark:hover:border-indigo-500"
            >
              <ArrowLeft className="h-4 w-4" />
              All Student categories
            </Link>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {main.description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {main.subcategories.map((sub, i) => {
            const count = studentToolsFor(main.id, sub.id).length
            return (
              <Link
                key={sub.id}
                to={`/students/${main.id}/${sub.id}`}
                className="animate-fade-up group flex flex-col rounded-2xl border border-indigo-100/90 bg-gradient-to-br from-white via-indigo-50/30 to-blue-50/20 p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 dark:border-indigo-950/40 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/20 dark:hover:border-indigo-500/50"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 transition-colors group-hover:text-indigo-700 dark:text-slate-100 dark:group-hover:text-indigo-300">
                    {sub.title}
                  </h3>
                  <span className="rounded-full border border-indigo-100 bg-indigo-50/80 px-2 py-0.5 text-[11px] font-bold text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-300">
                    {count} {count === 1 ? 'tool' : 'tools'}
                  </span>
                </div>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-indigo-500/80 dark:text-indigo-400/80">
                  {sub.tagline}
                </p>
                <p className="mt-2.5 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {sub.description}
                </p>
                <div className="mt-5 flex items-center justify-end">
                  <span className="flex items-center gap-1 text-sm font-bold text-indigo-600 transition group-hover:gap-2 dark:text-indigo-400">
                    Open <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}