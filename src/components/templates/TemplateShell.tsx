import { ShieldCheck, Sparkles } from 'lucide-react'
import Seo from '../../components/ui/Seo'
import type { RegistryTool } from '../../lib/toolRegistry'
import type { ReactNode } from 'react'

export function TemplateShell({
  tool,
  children,
  description,
}: {
  tool: RegistryTool
  children: ReactNode
  description?: string
}) {
  return (
    <>
      <Seo title={`${tool.name} - Free Online Tool | vimz Tools`} description={description ?? tool.description} />
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
            <ShieldCheck className="h-3.5 w-3.5" /> 100% free · runs in your browser
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {tool.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            {description ?? tool.description}
          </p>
          {tool.targetUser && (
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-primary-400">
              Built for {tool.targetUser}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {children}
        </div>

        <div className="mt-6 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-xs leading-relaxed text-amber-900">
            This is a lightweight starter template. The vimz team is continuously shipping richer
            dedicated versions of every tool in this category.
          </p>
        </div>
      </div>
    </>
  )
}

export const inputCls =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200'

export const btnCls =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50'

export const btnGhostCls =
  'inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary-400 hover:text-primary-700'