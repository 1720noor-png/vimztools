import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Seo from '../../components/ui/Seo'
import {
  findOfficeModule,
  officeSubcategoryLink,
  subcategoryToolCount,
} from './officeConfig'

export default function OfficeModulePage() {
  const { moduleId } = useParams<{ moduleId: string }>()
  const module = findOfficeModule(moduleId)

  if (!module) return <Navigate to="/office-corporate" replace />

  const Icon = module.icon

  return (
    <>
      <Seo
        title={`${module.label}: ${module.name} Tools - Free Online Tools | vimz Tools`}
        description={`Free ${module.name.toLowerCase()} tools - ${module.description}`}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-3 text-xs font-medium text-slate-400">
          <Link to="/" className="hover:text-primary-600">
            Home
          </Link>
          <span className="mx-1">/</span>
          <Link to="/office-corporate" className="hover:text-primary-600">
            Office &amp; Corporate Utilities
          </Link>
          <span className="mx-1">/</span>
          <span>{module.name}</span>
        </nav>

        <div className="relative mb-8 overflow-hidden rounded-3xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-emerald-50/80 p-6 shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/30 dark:via-slate-900/40 dark:to-teal-950/20 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-sm ${module.accent}`}
              >
                <Icon className="h-7 w-7" />
              </span>
              <div>
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-white/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 shadow-2xs dark:border-emerald-800/80 dark:bg-slate-800/90 dark:text-emerald-300">
                  {module.label}
                </span>
                <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                  {module.name}
                </h1>
              </div>
            </div>
            <Link
              to="/office-corporate"
              className="flex items-center gap-1.5 rounded-xl border border-slate-300/90 bg-white/90 px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-xs backdrop-blur-sm transition hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-200 dark:hover:border-emerald-500"
            >
              <ArrowLeft className="h-4 w-4" />
              All Office &amp; Corporate modules
            </Link>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {module.description}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {module.subcategories.map((sub, i) => {
            const count = subcategoryToolCount(module.id, sub.id)
            return (
              <Link
                key={sub.id}
                to={officeSubcategoryLink(module.id, sub.id)}
                className="animate-fade-up group flex flex-col rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/60 to-emerald-50/20 p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-600/10 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-850 dark:hover:border-emerald-500/50"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 transition-colors group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-300">
                    {sub.name}
                  </h3>
                  <span className="rounded-full border border-emerald-100 bg-emerald-50/80 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300">
                    {count} {count === 1 ? 'tool' : 'tools'}
                  </span>
                </div>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  {sub.tagline}
                </p>
                <p className="mt-2.5 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {sub.description}
                </p>
                <div className="mt-5 flex items-center justify-end">
                  <span className="flex items-center gap-1 text-sm font-bold text-emerald-600 transition group-hover:gap-2 dark:text-emerald-400">
                    Explore <ArrowRight className="h-4 w-4" />
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