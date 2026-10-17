import { Link } from 'react-router-dom'

export interface Crumb {
  label: string
  to?: string
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3 text-xs font-medium text-slate-400">
      {items.map((item, i) => {
        const last = i === items.length - 1
        return (
          <span key={`${item.label}-${i}`}>
            {i > 0 && <span className="mx-1.5 text-slate-300">/</span>}
            {item.to && !last ? (
              <Link to={item.to} className="transition hover:text-primary-600">
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-500">{item.label}</span>
            )}
          </span>
        )
      })}
    </nav>
  )
}