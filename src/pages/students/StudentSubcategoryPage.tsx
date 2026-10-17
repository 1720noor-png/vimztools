import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Seo from '../../components/ui/Seo'
import { ToolCard } from '../../components/ui/Cards'
import { findStudentSub, studentToolsFor } from './studentConfig'

export default function StudentSubcategoryPage() {
  const { mainCategory, sub } = useParams<{ mainCategory: string; sub: string }>()
  const found = mainCategory && sub ? findStudentSub(mainCategory, sub) : undefined

  if (!found) return <Navigate to={`/students/${mainCategory ?? ''}`} replace />

  const { main, sub: subInfo } = found
  const tools = studentToolsFor(main.id, subInfo.id)

  return (
    <>
      <Seo
        title={`${subInfo.title} - Free Online Tools | vimz Tools`}
        description={`Free ${subInfo.title.toLowerCase()} tools for students - ${subInfo.description}`}
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
          <Link to={`/students/${main.id}`} className="hover:text-primary-600">
            {main.title}
          </Link>
          <span className="mx-1">/</span>
          <span>{subInfo.title}</span>
        </nav>

        <div className="relative mb-8 overflow-hidden rounded-3xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/90 via-sky-50/40 to-indigo-50/80 p-6 shadow-sm dark:border-indigo-900/40 dark:from-indigo-950/30 dark:via-slate-900/40 dark:to-sky-950/20 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center rounded-full border border-indigo-200 bg-white/80 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 shadow-2xs dark:border-indigo-800/80 dark:bg-slate-800/90 dark:text-indigo-300">
                {main.title}
              </span>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                {subInfo.title}
              </h1>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-indigo-500/80 dark:text-indigo-400/80">
                {subInfo.tagline}
              </p>
            </div>
            <Link
              to={`/students/${main.id}`}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300/90 bg-white/90 px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-xs backdrop-blur-sm transition hover:border-indigo-400 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-200 dark:hover:border-indigo-500"
            >
              <ArrowLeft className="h-4 w-4" />
              All {main.title} categories
            </Link>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {tools.length} {tools.length === 1 ? 'tool' : 'tools'} in {subInfo.title} &mdash; {subInfo.description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools.map((t, i) => (
            <div
              key={t.id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <ToolCard tool={t} />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}