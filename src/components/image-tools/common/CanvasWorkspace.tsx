import React, { useEffect, useRef } from 'react'
import { CanvasEngine } from './CanvasWorker'

export interface CanvasWorkspaceProps {
  engine?: unknown
  canvasRef?: React.RefObject<HTMLCanvasElement | null>
  children?: React.ReactNode
  className?: string
  checkerboard?: boolean
  label?: string
}

export function CanvasWorkspace({
  canvasRef: externalCanvasRef,
  children,
  className = '',
  checkerboard = true,
  label = 'Live Canvas Viewport',
}: CanvasWorkspaceProps) {
  const internalCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const activeCanvasRef = externalCanvasRef ?? internalCanvasRef

  // Memory Leak Prevention: Release canvas buffer on unmount
  useEffect(() => {
    return () => {
      if (activeCanvasRef.current) {
        CanvasEngine.releaseCanvas(activeCanvasRef.current)
      }
    }
  }, [activeCanvasRef])

  return (
    <div
      aria-label={label}
      className={`relative overflow-hidden rounded-xl border border-sky-100 bg-slate-50/50 p-2 dark:border-sky-900/30 dark:bg-slate-950/40 ${className}`}
    >
      {/* SECTION 2: VIEWPORT & LIVE CANVAS ENGINE */}
      <div
        className={`relative flex min-h-[220px] w-full items-center justify-center overflow-auto rounded-lg ${
          checkerboard
            ? 'bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] dark:bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0]'
            : 'bg-white dark:bg-slate-900'
        }`}
      >
        {children ? (
          children
        ) : (
          <canvas
            ref={activeCanvasRef}
            className="max-h-[500px] max-w-full object-contain shadow-sm"
          />
        )}
      </div>
    </div>
  )
}

export default CanvasWorkspace
