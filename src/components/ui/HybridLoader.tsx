import { Loader2 } from 'lucide-react'

export default function HybridLoader({ label = 'Loading data…' }: { label?: string }) {
  return (
    <div className="flex h-40 items-center justify-center">
      <div className="flex items-center gap-2 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  )
}