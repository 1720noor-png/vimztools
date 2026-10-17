import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'

export interface CategoryTopSearchBarProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  toolCount?: number
  categoryName?: string
  className?: string
}

export default function CategoryTopSearchBar({
  value,
  onChange,
  placeholder = 'Search tools or folders in this category...',
  toolCount,
  categoryName,
  className = '',
}: CategoryTopSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Listen for Ctrl+K / Cmd+K to focus search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`group relative mx-auto w-full max-w-xl transition-all duration-300 ease-out ${
          isFocused ? 'max-w-2xl scale-[1.01]' : 'hover:max-w-[39rem]'
        }`}
      >
        <div
          className={`flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-md transition-all duration-300 dark:bg-[#111827] ${
            isFocused
              ? 'border-primary-500 ring-4 ring-primary-500/20 shadow-primary-500/10 dark:border-primary-400 dark:ring-primary-400/20'
              : 'border-slate-200 shadow-slate-900/5 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
          }`}
        >
          {/* Animated Magnifying Glass SVG */}
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 ${
              isFocused
                ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400'
                : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            <Search
              className={`h-4 w-4 transition-transform duration-300 ${
                isFocused ? 'scale-110' : 'group-hover:scale-105'
              }`}
            />
          </div>

          {/* Search Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
          />

          {/* Clear button when query is active */}
          {value.trim().length > 0 && (
            <button
              type="button"
              onClick={() => {
                onChange('')
                inputRef.current?.focus()
              }}
              className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Clear search query"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Keyboard Shortcut Indicator */}
          <div className="hidden shrink-0 items-center gap-1 sm:flex">
            <kbd className="inline-flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-500 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>

        {/* Real-time Result Count Chip */}
        {value.trim().length > 0 && typeof toolCount === 'number' && (
          <div className="mt-2 flex items-center justify-between px-2 text-xs text-slate-500 animate-fade-in dark:text-slate-400">
            <span>
              Filtering {categoryName ? `${categoryName} ` : ''}tools for{' '}
              <strong className="text-slate-800 dark:text-slate-200">"{value}"</strong>
            </span>
            <span className="font-semibold text-primary-600 dark:text-primary-400">
              {toolCount} {toolCount === 1 ? 'match' : 'matches'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
