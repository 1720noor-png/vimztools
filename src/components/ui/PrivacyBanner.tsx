import { ShieldCheck } from 'lucide-react'

export default function PrivacyBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 ${
        compact ? 'py-2' : 'py-3'
      }`}
    >
      <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
      <p className="text-sm font-medium text-emerald-800">
        Your files are processed 100% locally in your browser and are never uploaded.
      </p>
    </div>
  )
}