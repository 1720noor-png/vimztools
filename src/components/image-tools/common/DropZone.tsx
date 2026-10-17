import React, { useCallback, useRef, useState, useEffect } from 'react'
import { UploadCloud, AlertTriangle, X, Trash2, FileCheck } from 'lucide-react'
import { formatBytes } from '../../../lib/utils'

export interface ImageFileMetric {
  name: string
  size: number
  width?: number
  height?: number
  type?: string
}

export interface ImageDropZoneProps {
  accept?: string
  maxFiles?: number
  maxSizeBytes?: number // default 25MB (25 * 1024 * 1024)
  showDimensions?: boolean
  showFileSizeBadge?: boolean
  label?: string
  files?: ImageFileMetric[]
  onFiles?: (files: File[]) => void
  onClear?: () => void
  error?: string | null
  onDismissWarning?: () => void
  className?: string
  disabled?: boolean
}

const DEFAULT_ACCEPT = 'image/*,.bmp,.tif,.tiff,.heic,.heif,.avif,.svg,.ico'
const MAX_ALLOWED_SIZE = 25 * 1024 * 1024 // 25 MB limit

export function DropZone({
  accept = DEFAULT_ACCEPT,
  maxFiles = 1,
  maxSizeBytes = MAX_ALLOWED_SIZE,
  showDimensions = true,
  showFileSizeBadge = true,
  label,
  files = [],
  onFiles,
  onClear,
  error,
  onDismissWarning,
  className = '',
  disabled = false,
}: ImageDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [warningMessage, setWarningMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Sync external error if provided
  useEffect(() => {
    if (error) {
      setWarningMessage(error)
    }
  }, [error])

  const dismissWarning = useCallback(() => {
    setWarningMessage(null)
    onDismissWarning?.()
  }, [onDismissWarning])

  const validateAndForwardFiles = useCallback(
    (fileList: FileList | File[]) => {
      if (disabled) return
      dismissWarning()
      const raw = Array.from(fileList)
      if (raw.length === 0) return

      const acceptedFiles: File[] = []

      for (const file of raw) {
        // Size defense (>25MB)
        if (file.size > maxSizeBytes) {
          setWarningMessage(
            `"${file.name}" exceeds the 25 MB browser safety limit (${formatBytes(file.size)}). Please choose a smaller image to avoid memory exhaustion.`
          )
          return
        }

        // Zero-size or corrupt check
        if (file.size === 0) {
          setWarningMessage(`"${file.name}" has 0 bytes and appears to be corrupt.`)
          return
        }

        // Basic MIME validation
        const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
        const isSupportedExt = [
          'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tif', 'tiff', 'heic', 'heif', 'avif', 'svg', 'ico'
        ].includes(ext)

        if (!file.type.startsWith('image/') && !isSupportedExt) {
          setWarningMessage(
            `"${file.name}" is not a recognized image format. Please upload JPG, PNG, WebP, GIF, SVG, BMP, TIFF, or ICO.`
          )
          return
        }

        acceptedFiles.push(file)
        if (acceptedFiles.length >= maxFiles) break
      }

      if (acceptedFiles.length > 0 && onFiles) {
        onFiles(acceptedFiles)
      }
    },
    [disabled, dismissWarning, maxFiles, maxSizeBytes, onFiles]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragging(true)
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      if (disabled) return
      if (e.dataTransfer?.files) {
        validateAndForwardFiles(e.dataTransfer.files)
      }
    },
    [disabled, validateAndForwardFiles]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        validateAndForwardFiles(e.target.files)
      }
      // Reset input value so re-selecting the same file triggers change
      e.target.value = ''
    },
    [validateAndForwardFiles]
  )

  return (
    <div className={`space-y-3 ${className}`}>
      {/* SECTION 1: UPLOAD AREA */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label={label ?? (maxFiles > 1 ? `Upload up to ${maxFiles} images` : 'Upload image')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 cursor-pointer ${
          disabled
            ? 'cursor-not-allowed opacity-60 border-slate-200 bg-slate-50 dark:bg-slate-900/50'
            : isDragging
            ? 'border-sky-500 bg-sky-50/80 dark:border-sky-400 dark:bg-sky-950/30 ring-4 ring-sky-100 dark:ring-sky-900/40'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:border-sky-400 dark:hover:border-sky-500 hover:bg-sky-50/30'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 shadow-sm transition-transform group-hover:scale-105">
          <UploadCloud className="h-6 w-6" aria-hidden="true" />
        </div>

        <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
          {label ?? (maxFiles > 1 ? `Drop up to ${maxFiles} images here, or browse` : 'Drop an image here, or browse')}
        </p>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Supports PNG, JPG, WebP, SVG, GIF, AVIF, HEIC, TIFF • Max 25 MB • 100% in-browser
        </p>
      </div>

      {/* NON-BLOCKING INLINE WARNING MODAL / BANNER */}
      {warningMessage && (
        <div
          role="alert"
          className="animate-in fade-in slide-in-from-top-1 flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <span className="font-semibold">Notice:</span> {warningMessage}
            </div>
          </div>
          <button
            type="button"
            onClick={dismissWarning}
            className="rounded p-1 text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/50"
            aria-label="Dismiss warning"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* METRICS & LOADED FILES BADGES */}
      {files.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sky-100 bg-sky-50/50 px-3.5 py-2.5 text-xs text-slate-600 dark:border-sky-900/30 dark:bg-slate-800/80 dark:text-slate-300">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 font-semibold text-sky-700 dark:text-sky-400">
              <FileCheck className="h-3.5 w-3.5" />
              {files.length} {files.length === 1 ? 'file' : 'files'} loaded
            </span>

            {files[0] && (
              <span className="max-w-[200px] truncate font-medium text-slate-700 dark:text-slate-300" title={files[0].name}>
                {files[0].name}
              </span>
            )}

            {showDimensions && files[0]?.width && files[0]?.height && (
              <span className="inline-flex items-center rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                {files[0].width} × {files[0].height} px
              </span>
            )}

            {showFileSizeBadge && files[0]?.size && (
              <span className="inline-flex items-center rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                {formatBytes(files[0].size)}
              </span>
            )}
          </div>

          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export const ImageDropZone = DropZone
export default DropZone
