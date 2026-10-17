import { ChevronLeft, ChevronRight } from 'lucide-react'

function pageWindow(page: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const start = Math.max(2, Math.min(page - 2, total - 5))
  const end = Math.min(total - 1, start + 4)
  const window: number[] = []
  for (let p = start; p <= end; p++) window.push(p)
  return window
}

export default function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  const windowPages = pageWindow(page, totalPages)
  const base = 'inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40'
  const idle = 'border border-slate-300 bg-white text-slate-600 hover:border-primary-400 hover:text-primary-700'
  const active = 'border border-transparent bg-primary-600 text-white shadow-sm shadow-primary-600/25'

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
      <button className={`${base} ${idle}`} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
        <ChevronLeft className="h-4 w-4" />
      </button>
      {page > 3 && totalPages > 7 && (
        <>
          <button className={`${base} ${idle}`} onClick={() => onChange(1)}>1</button>
          <span className="px-1 text-sm text-slate-400">…</span>
        </>
      )}
      {windowPages.map((p) => (
        <button key={p} className={`${base} ${p === page ? active : idle}`} onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined}>
          {p}
        </button>
      ))}
      {page < totalPages - 2 && totalPages > 7 && (
        <>
          <span className="px-1 text-sm text-slate-400">…</span>
          <button className={`${base} ${idle}`} onClick={() => onChange(totalPages)}>{totalPages}</button>
        </>
      )}
      <button className={`${base} ${idle}`} disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}