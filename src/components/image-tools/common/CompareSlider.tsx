import React, { useState, useRef, useCallback, useEffect } from 'react'
import { ChevronsLeftRight } from 'lucide-react'

export interface CompareSliderProps {
  beforeUrl?: string | null
  afterUrl?: string | null
  beforeLabel?: string
  afterLabel?: string
  initialPosition?: number // 0..100, default 50
  className?: string
  aspectRatio?: number // safe against 0
}

export function CompareSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = 'Original',
  afterLabel = 'Processed',
  initialPosition = 50,
  className = '',
  aspectRatio,
}: CompareSliderProps) {
  const [sliderPos, setSliderPos] = useState<number>(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Safe aspect ratio (defense against division by zero)
  const safeAspectRatio = aspectRatio && aspectRatio > 0 ? aspectRatio : undefined

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    if (rect.width <= 0) return
    const offsetX = clientX - rect.left
    const percent = Math.min(100, Math.max(0, (offsetX / rect.width) * 100))
    setSliderPos(percent)
  }, [])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(true)
      updatePosition(e.clientX)
    },
    [updatePosition]
  )

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches[0]) {
        setIsDragging(true)
        updatePosition(e.touches[0].clientX)
      }
    },
    [updatePosition]
  )

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      updatePosition(e.clientX)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        updatePosition(e.touches[0].clientX)
      }
    }

    const handleStop = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleStop)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleStop)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleStop)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleStop)
    }
  }, [isDragging, updatePosition])

  // If neither image exists
  if (!beforeUrl && !afterUrl) {
    return (
      <div
        className={`flex h-64 w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900/40 ${className}`}
      >
        <span>No image loaded. Upload an image above to see live preview.</span>
      </div>
    )
  }

  // If only one image is available, render single preview gracefully
  if (!beforeUrl || !afterUrl) {
    const singleUrl = afterUrl || beforeUrl
    const label = afterUrl ? afterLabel : beforeLabel
    return (
      <div className={`relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center ${className}`}>
        <img
          src={singleUrl ?? undefined}
          alt={label}
          style={safeAspectRatio ? { aspectRatio: String(safeAspectRatio) } : undefined}
          className="max-h-[480px] w-full object-contain"
        />
        <div className="absolute top-3 left-3 rounded-md bg-slate-900/75 px-2 py-1 text-[11px] font-semibold text-white shadow backdrop-blur-sm">
          {label}
        </div>
      </div>
    )
  }

  // Both images exist: Render interactive split slider
  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={safeAspectRatio ? { aspectRatio: String(safeAspectRatio) } : undefined}
      className={`group relative max-h-[500px] w-full select-none overflow-hidden rounded-xl border border-slate-200 bg-slate-900 dark:border-slate-800 cursor-ew-resize ${className}`}
    >
      {/* Background (After / Processed Image) */}
      <img
        src={afterUrl}
        alt={afterLabel}
        className="h-full w-full object-contain"
        draggable={false}
      />
      <div className="pointer-events-none absolute top-3 right-3 rounded-md bg-sky-600/80 px-2 py-1 text-[11px] font-semibold text-white shadow backdrop-blur-sm">
        {afterLabel}
      </div>

      {/* Foreground (Before / Original Image clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <div
          className="relative h-full"
          style={{
            width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
          }}
        >
          <img
            src={beforeUrl}
            alt={beforeLabel}
            className="h-full w-full object-contain"
            draggable={false}
          />
          <div className="pointer-events-none absolute top-3 left-3 rounded-md bg-slate-900/80 px-2 py-1 text-[11px] font-semibold text-white shadow backdrop-blur-sm">
            {beforeLabel}
          </div>
        </div>
      </div>

      {/* Divider Bar & Handle */}
      <div
        className="absolute top-0 bottom-0 z-10 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-700 shadow-md ring-2 ring-sky-500 hover:scale-110 active:scale-95 transition-transform">
          <ChevronsLeftRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}

export const BeforeAfterSlider = CompareSlider
export default CompareSlider
