import { Loader2 } from 'lucide-react'

export function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const dims =
    size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6'
  return <Loader2 className={`animate-spin ${dims} ${className}`} />
}

export function LoadingOverlay({
  message = 'Processing...',
}: {
  message?: string
}) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/80 backdrop-blur-sm">
      <Spinner size="lg" className="text-primary-600" />
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  )
}