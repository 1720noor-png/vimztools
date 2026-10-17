import type { CSSProperties, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { ExactCategory } from '../../lib/categoryAccents'

export default function CategoryHero({
  title,
  description,
  icon: Icon,
  accent,
  action,
}: {
  title: string
  description: string
  icon?: LucideIcon
  accent: ExactCategory
  action?: ReactNode
}) {
  return (
    <div
      className="accent-hero relative mb-8 overflow-hidden rounded-3xl border-2 px-6 py-8 sm:px-8"
      style={
        {
          '--cat-bg': accent.bg,
          '--cat-bg-dark': accent.bgDark,
          '--cat-accent': accent.accent,
        } as CSSProperties
      }
    >
      {Icon && (
        <span className="pointer-events-none absolute -right-4 -top-4 hidden opacity-[0.14] sm:block">
          <Icon className="h-32 w-32" strokeWidth={1.5} />
        </span>
      )}
      {action && <div className="absolute right-6 top-6">{action}</div>}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed sm:text-base">{description}</p>
    </div>
  )
}