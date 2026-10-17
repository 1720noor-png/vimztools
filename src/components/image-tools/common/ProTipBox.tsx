import { Lightbulb, Sparkles } from 'lucide-react'

export interface ProTipCardProps {
  category: string
  tipContent: string
  shortcuts?: string[]
  className?: string
}

export function ProTipBox({
  category,
  tipContent,
  shortcuts = [],
  className = '',
}: ProTipCardProps) {
  return (
    <div
      role="region"
      aria-label="Pro Tip"
      className={`rounded-xl border border-sky-100 bg-sky-50/40 p-4 dark:border-sky-900/30 dark:bg-slate-900/60 ${className}`}
    >
      {/* SECTION 4: CONTEXTUAL GUIDANCE */}
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
          <Lightbulb className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
              <Sparkles className="h-3 w-3" />
              {category} Pro Tip
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {tipContent}
          </p>
          {shortcuts.length > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pt-2 border-t border-sky-100/80 dark:border-sky-900/20 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-400">Shortcuts:</span>
              {shortcuts.map((sc) => (
                <kbd
                  key={sc}
                  className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {sc}
                </kbd>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const ProTipCard = ProTipBox
export default ProTipBox
