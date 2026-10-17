import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Seo from '../../components/ui/Seo'
import { ToolCard } from '../../components/ui/Cards'
import {
  findOfficeModule,
  findOfficeSubcategory,
  officeModuleLink,
  officeToolsForSubcategory,
  moduleToolCount,
  subcategoryToolCount,
} from './officeConfig'

export default function OfficeSubcategoryPage() {
  const { moduleId, subcategoryId } = useParams<{
    moduleId: string
    subcategoryId: string
  }>()

  const module = findOfficeModule(moduleId)
  const sub = findOfficeSubcategory(moduleId, subcategoryId)

  if (!module) return <Navigate to="/office-corporate" replace />
  if (!sub) return <Navigate to={officeModuleLink(module.id)} replace />

  const tools = officeToolsForSubcategory(module.id, sub.id)
  const moduleCount = moduleToolCount(module.id)
  const count = subcategoryToolCount(module.id, sub.id)

  return (
    <>
      <Seo
        title={`${sub.name} - ${module.name} Tools | vimz Tools`}
        description={`Free ${sub.name.toLowerCase()} tools - ${sub.description}`}
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
          <Link to={officeModuleLink(module.id)} className="hover:text-primary-600">
            {module.name}
          </Link>
          <span className="mx-1">/</span>
          <span>{sub.name}</span>
        </nav>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50 via-white to-teal-50 p-6 shadow-sm dark:border-emerald-900/40 dark:from-emerald-950/40 dark:via-[#111827] dark:to-teal-950/20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              {module.label} · {module.name}
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">{sub.name}</h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {sub.description}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {count} {count === 1 ? 'tool' : 'tools'} in this category · {moduleCount} total {module.name} tools
            </p>
          </div>
          <Link
            to={officeModuleLink(module.id)}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-2xs transition hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-900 dark:bg-slate-900 dark:text-emerald-300"
          >
            <ArrowLeft className="h-4 w-4" />
            All {module.name} sub-categories
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools.map((tool, i) => (
            <div key={tool.id} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
              <ToolCard tool={tool} />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}