import React, { useState, useCallback, useRef } from 'react'
import {
  Download,
  ClipboardCopy,
  Check,
  ChevronDown,
  Play,
  RefreshCw,
  Loader2,
  Sliders,
} from 'lucide-react'
import type { OutputFile } from '../../../pages/image-tools/engine/types'

export interface ExportDropdownProps {
  formats?: ('JPG' | 'PNG' | 'WebP' | 'ICO' | 'PDF' | string)[]
  allowClipboardCopy?: boolean
  selectedFormat?: string
  onFormatChange?: (format: string) => void
  onExport?: (format: string) => void
  onDownloadAll?: () => void
  onCopy?: () => void
  disabled?: boolean
  files?: OutputFile[]
  copyText?: string
  className?: string
}

export function ExportDropdown({
  formats = ['JPG', 'PNG', 'WebP'],
  allowClipboardCopy = true,
  selectedFormat,
  onFormatChange,
  onExport,
  onDownloadAll,
  onCopy,
  disabled = false,
  files = [],
  copyText,
  className = '',
}: ExportDropdownProps) {
  const [currentFormat, setCurrentFormat] = useState(selectedFormat ?? formats[0] ?? 'PNG')
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  const handleSelectFormat = useCallback(
    (fmt: string) => {
      setCurrentFormat(fmt)
      onFormatChange?.(fmt)
      setIsOpen(false)
    },
    [onFormatChange]
  )

  const handleDownload = useCallback(() => {
    if (disabled) return
    if (files.length > 0) {
      if (onDownloadAll) {
        onDownloadAll()
        return
      }
      // Download first file by default
      const file = files[0]
      const url = URL.createObjectURL(file.blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } else if (onExport) {
      onExport(currentFormat)
    }
  }, [currentFormat, disabled, files, onDownloadAll, onExport])

  const handleCopy = useCallback(async () => {
    if (disabled) return
    if (onCopy) {
      onCopy()
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      return
    }

    if (copyText) {
      try {
        await navigator.clipboard.writeText(copyText)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // clipboard error
      }
      return
    }

    // Try copying image blob to clipboard if available and supported
    if (files.length > 0 && files[0]?.blob && typeof ClipboardItem !== 'undefined') {
      try {
        const item = new ClipboardItem({ [files[0].blob.type]: files[0].blob })
        await navigator.clipboard.write([item])
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // Fallback or permission blocked
      }
    }
  }, [copyText, disabled, files, onCopy])

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* FORMAT PICKER DROPDOWN */}
      {formats.length > 1 && (
        <div ref={dropdownRef} className="relative inline-block text-left">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>Format: {currentFormat}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {isOpen && (
            <div className="absolute right-0 z-50 mt-1 w-32 origin-top-right rounded-xl border border-slate-200 bg-white p-1 shadow-lg ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-800">
              {formats.map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => handleSelectFormat(fmt)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                    currentFormat === fmt
                      ? 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{fmt}</span>
                  {currentFormat === fmt && <Check className="h-3 w-3" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DOWNLOAD BUTTON */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleDownload}
        className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 transition"
      >
        <Download className="h-3.5 w-3.5" />
        <span>{files.length > 1 ? `Download ${files.length} Files` : `Export ${currentFormat}`}</span>
      </button>

      {/* CLIPBOARD COPY BUTTON */}
      {allowClipboardCopy && (
        <button
          type="button"
          disabled={disabled}
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 disabled:cursor-not-allowed disabled:opacity-50 transition"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <ClipboardCopy className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}

export interface ControlToolbarProps {
  sliders?: string[]
  canRun?: boolean
  isBusy?: boolean
  progress?: string
  onRun?: () => void
  onReset?: () => void
  children?: React.ReactNode
  className?: string
}

export function ControlToolbar({
  sliders,
  canRun = true,
  isBusy = false,
  progress,
  onRun,
  onReset,
  children,
  className = '',
}: ControlToolbarProps) {
  return (
    <div
      className={`flex flex-col gap-4 rounded-xl border border-sky-100 bg-sky-50/30 p-4 dark:border-sky-900/30 dark:bg-slate-800/40 ${className}`}
    >
      {/* SECTION 3: ACTION CONTROLS & EXPORTER */}
      {sliders && sliders.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Sliders className="h-3.5 w-3.5" />
            Controls:
          </span>
          {sliders.map((s) => (
            <span
              key={s}
              className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* ACTION BUTTONS & CHILDREN CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {onRun && (
            <button
              type="button"
              onClick={onRun}
              disabled={isBusy || !canRun}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isBusy ? 'Processing…' : 'Run tool'}
            </button>
          )}

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              disabled={isBusy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:border-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}

          {isBusy && progress && (
            <span className="text-xs font-medium text-sky-600 dark:text-sky-400 animate-pulse">
              {progress}
            </span>
          )}
        </div>

        {/* EXPORTER / ACTIONS */}
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      </div>
    </div>
  )
}

export default ExportDropdown
