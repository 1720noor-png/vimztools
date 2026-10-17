import { Link } from 'react-router-dom'
import { FolderOpen, ArrowUpRight, Wrench } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { folderAccentTone } from '../../lib/folderAccent'

export function FolderCard({
  name,
  toolCount,
  path,
  accentId,
}: {
  name: string
  toolCount?: number
  path: string
  accentId?: string
}) {
  const tone = folderAccentTone(accentId ?? '')
  return (
    <Link
      to={path}
      className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/50 to-indigo-50/20 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-400 hover:shadow-xl hover:shadow-primary-600/10 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-850 dark:hover:border-primary-500"
    >
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-xs transition-transform duration-200 group-hover:scale-105 ${tone}`}>
        <FolderOpen className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-bold text-slate-900 transition-colors group-hover:text-primary-700 dark:text-slate-100 dark:group-hover:text-primary-300">
          {name}
        </h3>
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
          {toolCount !== undefined ? `${toolCount} tools` : 'Browse tools'}
        </p>
      </div>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary-500 dark:text-slate-500" />
    </Link>
  )
}

export function DataToolCard({
  name,
  description,
  category,
  path,
  icon: Icon = Wrench,
}: {
  name: string
  description: string
  category?: string
  path: string
  icon?: LucideIcon
}) {
  return (
    <Link
      to={path}
      className="group flex flex-col rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/60 to-primary-50/20 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-400 hover:shadow-xl hover:shadow-primary-600/10 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-850 dark:hover:border-primary-500"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary-200/60 bg-primary-50 text-primary-600 shadow-2xs transition-all duration-200 group-hover:scale-105 group-hover:bg-primary-600 group-hover:text-white dark:border-primary-900/50 dark:bg-primary-950/50 dark:text-primary-300">
        <Icon className="h-4 w-4" />
      </span>
      <h4 className="mt-3 line-clamp-1 text-[15px] font-bold text-slate-900 transition-colors group-hover:text-primary-700 dark:text-slate-100 dark:group-hover:text-primary-300">
        {name}
      </h4>
      <p className="mt-1 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
      {category && (
        <span className="mt-3 inline-flex items-center text-[11px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
          {category}
        </span>
      )}
    </Link>
  )
}